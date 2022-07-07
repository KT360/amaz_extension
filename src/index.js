
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

const ctx = document.getElementById("pieChart").getContext("2d");
const data = {
    labels: [
      'Positive',
      'Hesitant',
      'Negative'
    ],
    datasets: [{
      label: 'Review Set',
      data: [85, 2, 13],
      backgroundColor: [
        'rgb(64, 237, 168)',
        'rgb(237, 228, 64)',
        'rgb(222, 68, 51)'
      ],
      hoverOffset: 4
    }]
  };

const myChart = new Chart(ctx,{
    type: 'pie',
    data: data
});

const axios = require('axios');
const nlp = require('compromise');

document.getElementById("start_button").addEventListener("click", displayInfo);


var asin_number = null;
var product_link = null;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { msg: "isProduct" }, (response) => {
      if (response) {
        if(response.is_product === true)
        {
          document.getElementById('start_button').classList.remove('noHover');
          document.getElementById('warning').style.display = 'none';
          asin_number = response.asin;
          product_link = response.link;
        }else
        {
          document.getElementById('start_button').classList.toggle('noHover');
          document.getElementById('warning').style.display = 'inline-block';
        }
      }else
      {
        document.getElementById('start_button').classList.toggle('noHover');
        document.getElementById('warning').style.display = 'inline-block';
      }
  })
});


var reviews = null;

function displayInfo()
{
  if(asin_number)
  {
    // set up the request parameters
    const params = {
      api_key: "9F55EBA1740A4E8F871F0809FAFB5B67",
      type: "reviews",
      amazon_domain: getDomain(product_link),
      asin: asin_number
    }
    document.getElementById('dual-ring').style.display = 'inline-block';
    // make the http GET request to Rainforest API
    axios.get('https://api.rainforestapi.com/request', { params })
      .then(response => {
        //Get top used adjectives
        reviews = response.data.reviews;
        let text = getPositiveText(reviews);
        let first = getTextAdjectives(text); 
        let next = getAdjFreq(first);
        let after = filterWords(next);
        updateTable(after);
        //Get ratio of responses
        myChart.data.datasets[0].data =  getPercentage(response.data);
        myChart.update();
        //update html
        document.getElementById('dual-ring').style.display = 'none';
        document.getElementById('success').style.display = 'inline-block';
        }).catch(error => {
          // catch and print the error
          console.log(error);
        })
      }
}

function getDomain(url)
{
  if(url.includes("amazon.com"))
  {
    return "amazon.com";
  }else
  {
    return "amazon.ca";
  }
}

function getPercentage(data)
{

    var pos = 0;
    var neg = 0;
    var hes = 0;

    var ratings = data.summary.rating_breakdown;

    pos = ratings.five_star.percentage + ratings.four_star.percentage;
    neg = ratings.two_star.percentage + ratings.one_star.percentage;
    hes = ratings.three_star.percentage;


    return [pos,hes,neg];
}



function getPositiveText(array)
{
    let new_arr = [];
    let text = '';

    array.forEach(element => {
        if(element.rating > 3)
        {
            new_arr.push(element);
        }
    });

    new_arr.forEach( element => {
        text += element.body;
    });

    return text;
}

function getNegativeText(array)
{
    let new_arr = [];
    let text = '';

    array.forEach(element => {
        if(element.rating < 3)
        {
            new_arr.push(element);
        }
    });

    new_arr.forEach( element => {
        text += element.body;
    });

    return text;
}

function getTextAdjectives(txt)
{
    let doc = nlp (txt);
    let lower = doc.match('#Adjective').toLowerCase().text();
    let final = lower.replace('!','').replace('.','').replace(',','');

    return final;
}

function getAdjFreq(text)
{
    let str_arr = text.split(' ');
    let dic = {};

    for(let i = 0; i<str_arr.length; i++)
    {
        let word = str_arr[i];
        if(dic[word])
        {
            dic[word] += 1;
        }else{
            dic[word] = 1;
        }
    }

    return dic;

}


function filterWords(dict)
{
    let items = Object.keys(dict).map(
        (key) => {return [key,dict[key]]}
    );

    items.sort(
        (first,second) => {return second[1] - first[1]}
    );

    let next = items.map(
        (item) => {
            return item[0]
        }
    );
    
    let final = next.slice(0,5);

    return final;
}

function updateTable(adj_array)
{
    let table = document.getElementById('Table');
    adj_array.forEach((item) => {
      let row = table.insertRow();
      let adj = row.insertCell(0);
      adj.innerHTML = item;
    });
}