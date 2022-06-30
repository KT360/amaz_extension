function getAsin(url)
{
    if(url)
    {
        var locate = url.indexOf('/dp/');

        if(locate !== -1)
        {
            var start = locate+4;
            var asin_number = '';
            for(let i = start; i<url.length; i++)
            {
                if(url.charAt(i) !== '/')
                {
                    asin_number += url.charAt(i);
                }else
                {
                    break;
                }
            }

            return asin_number;
        }else
        {
            return null;
        }
    }else
    {
        return null;
    }
}


chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.onUpdated.addListener(
        function(tabId, changeInfo, tab)
        {
            
            if(changeInfo.status === 'complete')
            {
                if(getAsin(tab.url))
                {
                    chrome.tabs.sendMessage(tabId, {msg: 'product-page', data: [getAsin(tab.url), tab.url]}, (response) => {
                        if(response)
                        {
                            console.log(response);
                        }
                    });
                    
                }else
                {
                    console.log('nope');
                }
            }
        }
    );
});
