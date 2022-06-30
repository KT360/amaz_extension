var isProduct = false;
var _asin = null;
var _link = null;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse)
    {  
        if(request)
        {
            console.log('message!');
            if(request.msg === 'product-page')
            {
                sendResponse({msg: 'success'});
                isProduct = true;
                _asin = request.data[0];
                _link = request.data[1];
            }else if(request.msg === 'isProduct')
            {
                sendResponse({is_product: isProduct, asin: _asin, link: _link});
            }
        }
    }
);

