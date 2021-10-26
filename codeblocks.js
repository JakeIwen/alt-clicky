
$(function() { 
  initAltClick();
  amzn();
  // ebay();
  tndr();
  fcbk();
  initFilter();

})

// if (window.location.host.includes('quickbase.com')) qb();

async function amzn() {
  const {host, href} = location
  
  if(!host.includes('amazon.com')) return;
  // always smile.amazon.com
  if(host == 'amazon.com') {
    return location.href = href.replace(/https:\/\/www.amazon\.com/, 'https://smile.amazon.com')
  }
  // prevent subscription default
  $('#newAccordionRow').find(':contains("One-time purchase:")').last().click();

}

function addedObserver(cbk) {
  const observer = new MutationObserver( (mutList) => mutList.map(m => cbk(m)) )
  observer.observe($('body')[0], { childList: true, subtree: true });
}

function attrObserver(callback, attributeFilter) {
  const observer = new MutationObserver( (mutationsList, observer) => {
    for(const mutation of mutationsList) {
      callback(mutation)
    }
  })
  observer.observe($('body')[0], { attributes: true, subtree: true, attributeFilter });
}

async function tndr() {

  if(!location.host.includes('tinder.com')) return;

  const selectors = [
    'body > div > span.StretchedBox[style="opacity: 1;"]',
    '.onboarding.CenterAlign.StretchedBox',
    '.onboarding__page',
    '.onboarding__modal',
    '.onboarding-modal',
  ]
  
  const mCbk = ({target}) => {
    var $el = $(target)
    if (!selectors.some(s => $el.is(s))) return;
    console.log(target);
    $el.remove();
  }
  
  await timeout(3000);
  const observer = attrObserver(mCbk);
  selectors.map(s => $(s).remove().length && console.log(s));

}

function ebay() {
  if(!location.host.includes('ebay.com')) return;
  hideSponsored();
  
  function hideSponsored(){
    if(location.pathname.includes('/sch')) {
      var rtx = $('.s-item__title--tagblock span[role="text"]');
      if(rtx[0].outerText === "SPONSORED") $(rtx).closest('.s-item--watch-at-corner').remove();
      // var roleTexts = $('.s-item__title--tagblock span[role="text"]');
        // $(roleTexts).each(function() {
        //   if(this.outerText !== "SPONSORED") return;
        //   $(this).closest('.s-item--watch-at-corner').remove();
        // })
    }
  }

     
    // loc.href = loc.href.replace('www.amazon.com/', 'smile.amazon.com/')
    
    // dropdown clicks


}

async function fcbk() {
  if(!location.host.includes('facebook.com')) return;
  const adSelector = 'a[href][aria-labelledby][rel="nofollow noopener"]'

  const cbk = (mutation) => { 
    let $tgt = $(mutation.target);
    let $ads = $tgt[0].tagName === 'DIV' && $tgt.find(adSelector)
    if($ads && $ads.length) {
      console.log('removing on', `$tgt.find(${adSelector})`, $tgt);
      $ads.remove();
    }
  }
  const observer = new MutationObserver( (mutList) => mutList.map(m => cbk(m)) )
  observer.observe($('body')[0], { childList: true, subtree: true });
  
  $('').parent().remove();
}

function qb() {
  
  var actualCode = `
    window.oldSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function (data) {
      window.oldSend.call(this, data);
      var qbRequest = getJsonFromUrl(this.responseURL);
      var dataParams = getJsonFromUrl(window.location.origin + '?' + data);
      console.log('QB Req: ', {...qbRequest, dataParams});
    }

    function getJsonFromUrl(url) {
      if(!url) url = location.href;
      var question = url.indexOf("?");
      var hash = url.indexOf("#");
      if(hash==-1 && question==-1) return {};
      if(hash==-1) hash = url.length;
      var query = question==-1 || hash==question+1 ? url.substring(hash) : 
      url.substring(question+1,hash);
      var result = {};
      query.split("&").forEach(function(part) {
        if(!part) return;
        part = part.split("+").join(" "); // replace every + with space, regexp-free version
        var eq = part.indexOf("=");
        var key = eq>-1 ? part.substr(0,eq) : part;
        var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
        var from = key.indexOf("[");
        if(from==-1) result[decodeURIComponent(key)] = val;
        else {
          var to = key.indexOf("]",from);
          var index = decodeURIComponent(key.substring(from+1,to));
          key = decodeURIComponent(key.substring(0,from));
          if(!result[key]) result[key] = [];
          if(!index) result[key].push(val);
          else result[key][index] = val;
        }
      });
      return result;
    }
  `;
  document.documentElement.setAttribute('onreset', actualCode);
  document.documentElement.dispatchEvent(new CustomEvent('reset'));
  document.documentElement.removeAttribute('onreset');

}

function initAltClick() {
  let active = false;
  let wlStack = [];
  
  const keyDown = ({ctrlKey, shiftKey, metaKey, key}) => {
    
    if (key === 'i' && shiftKey && metaKey) {
      console.log('removing iframes');
      $('iframe').remove();
    }
    if (key !== 'Alt' ) return;
    const hasOtherModKey = ctrlKey || shiftKey || metaKey;
    active = !hasOtherModKey  ? activate() : deactivate();

  }
  
  const handleClick = (shiftKey, target) => {
    if (shiftKey) {
      const orig = wlStack.pop();
      const plcHdr = wlStack.pop();
      return $(`#acy-${wlStack.length}`).replaceWith(orig);
    } 
    
    console.log('target: ', target);
    
    const plcHdrStg = `<i id="acy-${wlStack.length}"></i>`;
    wlStack.push($(target).after(plcHdrStg));
    wlStack.push(target);
    $(target).detach();
  }
  
  const deactivate = () => {
    $('*').removeClass('mouseOn');  
    $('body').unbind();
    return false;
  }

  const activate = () => {
    
    $('body').mousemove( ({target}) => {
      $('*').removeClass('mouseOn');
      $(target).addClass('mouseOn');
      $(target).attr('type') === 'password' && $(target).attr('type', '');
    });
    
    $('body').click( ({shiftKey, target, preventDefault}) => {
      preventDefault();
      handleClick(shiftKey, target);
    });
    
    return true;
  }
  
  $( document ).keydown( keyDown );
  $( document ).keyup( ({key}) => active = deactivate() );
}

function timeout(ms) {
  return new Promise(res => setTimeout(res, ms))
}

function mode(arr, comprtr=(a,b)=>a===b){
  return arr.sort((a,b) =>
    arr.filter(v => comprtr(v,a)).length - arr.filter(v => comprtr(v,b)).length
  ).pop();
}

function sameParent(a,b) {
  return $(a).parent().is($(b).parent())
}

// mode(['pear', 'apple', 'orange', 'apple']); // apple

class FilterSort {
  
  constructor() {
    this.urlList = [];
    this.loadedUrls = [];
    this.options = {};
    this.initComplete = false;
    this.matchText = '';
    this.curPageNum = null;
  }
  
  init() {
    this.itemEl = this.getItemElement();
    this.attrSelectors = this.attrSelectors ||
      this.itemEl.tagName.toLowerCase() + 
      Array.from(this.itemEl.attributes).map(a => `[${a.name}]`).slice(0,3).join('');
    this.curPageNum = this.curPageNum || this.parsePageNum();
    console.log('INITISLIZED FILTERSORT', this);
  }
  
  async run(options) {
    this.options = options
    if (!this.initComplete) {
      if (!this.getText()) return console.log('select some text first');
      this.init();
    }
    if (options.loadMore) {
      if(!this.urlList.length) this.updatePageURIs($('body'));
      await this.loadMorePages(this.urlList, this.attrSelectors, $(this.itemEl).parent());
    }
    this.applyFilters(this.itemEl, this.attrSelectors)
    console.log('done', this);
  }
  
  getText = () => {
    if (window.getSelection) {
      return window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
      return document.selection.createRange().text;
    } else {
      return '';
    }
  }
  
  hasEnoughSiblings = (source, threshold=9) => {
    const sibs = $(source).siblings()
    const tags = $(sibs).map((_, el) => el.nodeName).toArray()
    const tagSiblings = $(sibs).filter(mode(tags)).toArray();
    const hasParent = mode(tagSiblings, sameParent);
    const withCommonParent = $(sibs).filter((_, el) => sameParent(el, hasParent))
    console.log('len', withCommonParent.length);
    return withCommonParent.length > 9;
  }

  getItemElement = () => {
    let cur = window.getSelection().anchorNode;
    do {
      cur = $(cur).parent();
      if (cur[0].nodeName === 'BODY') return null;
    } while (!this.hasEnoughSiblings(cur));
    return cur[0];
  }
  
  parsePageNum = (uri=window.location.href) => {
    try {
      return parseInt(uri.match(/(?:(page|pg)\w*=)\d{1,2}/gi)[0].split('=')[1]) 
    } catch(e) {
      return 1
    }
  }
  
  updatePageURIs = (html) => {
    const newURIs = $(html).find('[href]').map((_,el) => $(el).attr('href'))
      .toArray()
      .filter(href => href.match(/(page|pg)\w*=\d{1,2}/gi))
      .sort()

    this.urlList = [...new Set([...this.urlList, ...newURIs])];
    const pMap = this.urlList.reduce((acc,cur) => {
      const pNum = this.parsePageNum(cur);
      return (pNum <= this.curPageNum || acc[pNum]) ? acc : {...acc, [pNum]: cur};
    }, {})
    
    this.pMap = pMap;
    console.log({pMap});
    return Object.values(pMap);
  }
  
  addPageResults = (uri, attrSelectors, $container) => {
    return new Promise((resolve) => {
      $('#loaderElement').load(`${uri} ${attrSelectors}`, null, (...args) => {
        $($container).append($('#loaderElement').children());
        this.loadedUrls.push(uri);
        this.curPageNum = this.parsePageNum(uri);
        $('#loaderElement').empty()
        resolve()
      });
    })
  }
  
  async loadMorePages(uris, attrSelectors, $container, maxPages=10) {
    const pendingUrls = uris.filter(u => !this.loadedUrls.includes(u));
    while(pendingUrls.length < 10) {
      const lastUrl = pendingUrls[pendingUrls.length-1];
      const lastPgNum = this.parsePageNum(lastUrl);
      const nextUrl = lastUrl.replace(new RegExp(`=${lastPgNum}`), `=${lastPgNum + 1}`)
      pendingUrls.push(nextUrl)
      console.log({lastUrl, nextUrl})
    }
    console.log('total items: before', $(attrSelectors).length);
    $($container).children().show()
    $('body').append(`<div id="loaderElement"></div>`);
    for (let uri of pendingUrls.slice(0, maxPages)) {
      await this.addPageResults(uri, attrSelectors, $container);
      console.log('total items: after', $(attrSelectors).length);
    }
    $('#loaderElement').remove();
  }
  
  applyFilters = (itemEl, attrSelectors) => {
    const {exclude, include} = this.options;
    const searchItems = $(itemEl).parent().children(attrSelectors);
    this.matchText = this.getText() || this.matchText;
    console.log('filtering', this.options, this.matchText, searchItems);
    console.log('before', $(searchItems).filter(":visible").length);
    if (this.matchText) {
      exclude && $(searchItems).each((_,el) => el.innerText.includes(this.matchText) && $(el).hide());
      include && $(searchItems).each((_,el) => {
        !el.innerText.includes(this.matchText) && $(el).hide()
      });
    }
    console.log('after', $(searchItems).filter(":visible").length);
    
  }

}

function initFilter() {
  
  const filterSort = new FilterSort();
  
  $( document ).on('keydown', function(k) {
    const {altKey, shiftKey, metaKey, ctrlKey, key} = k;
    if (altKey && metaKey && key.toLowerCase() === "å") {
      const opts = {[shiftKey ? 'exclude' : 'include']: true,}
      if (ctrlKey) opts.loadMore = true;
      filterSort.run(opts)
    }
  } );
  
}

