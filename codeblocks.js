
$(function() { 
  jq()
  initAltClick();
  amzn();
  // ebay();
  tndr();
  fcbk();
  initFilter();

})

// if (window.location.host.includes('quickbase.com')) qb();

function jq() {
  var devtools = function() {};
  devtools.toString = function() {
    if (!this.opened && $.toString().includes('[native code]')) {
      console.log('appending jq');
      $('head').append(`<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>`)
    }
    this.opened = true;
  }
  console.log('%c', devtools);
}

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
    this.curPageNum = null;
    this.searchInclude = [];
    this.searchExclude = [];
    this.cssExclude = [];
    $('#searchInclude').on('change submit', (e) => {
      this.searchInclude = JSON.parse(e.target.value);
      $('#searchIncludeList').text(JSON.stringify(this.searchInclude))
      this.applyFilters(this.itemEl, this.attrSelectors)
    })
    $('#searchExclude').on('change submit', (e) => {
      this.searchExclude = JSON.parse(e.target.value);
      $('#searchExcludeList').text(JSON.stringify(this.searchExclude))
      this.applyFilters(this.itemEl, this.attrSelectors)
    })
    $('#cssExclude').on('change submit', (e) => {
      this.cssExclude = $('#cssExcludeList').text()
      this.applyFilters(this.itemEl, this.attrSelectors)
    })
    $('#loadMore').click( async () => {
      if (!this.initComplete) {
        if (!this.getText()) return console.log('select some text first');
        this.init();
      }
      if(!this.urlList.length) this.updatePageURIs($('body'));
      await this.loadMorePages(this.urlList, this.attrSelectors, $(this.itemEl).parent());
      this.applyFilters(this.itemEl, this.attrSelectors)
    })
  }
  
  init() {
    this.itemEl = this.getItemElement();
    this.attrSelectors = this.itemEl.tagName.toLowerCase() + 
      Array.from(this.itemEl.attributes).map(a => `[${a.name}]`).slice(0,3).join('');
    this.curPageNum = this.curPageNum || this.parsePageNum();
    console.log('INITISLIZED FILTERSORT', this);
    $('#fSearch').show()
    this.initComplete = true;
  }
  
  async run() {
    if (!this.initComplete) {
      if (!this.getText()) return console.log('select some text first');
      this.init();
    }
    this.applyFilters(this.itemEl, this.attrSelectors)
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
  
  getNumSiblings = $source => {
    const tagName = $source[0].tagName;
    return $source.parent().parent().children().children(tagName).length;
    // return $source.siblings(tagName).length;
  }

  getItemElement = () => {
    let cur = window.getSelection().anchorNode;
    let elWithMostSibs = null;
    let mostSibs = 0;
    do {
      cur = $(cur).parent();
      const numSibs = this.getNumSiblings(cur);
      console.log({numSibs, cur});
      if (numSibs > mostSibs) {
        mostSibs = numSibs;
        elWithMostSibs = cur[0];
      }
    } while ($(cur).parent().length);
    
    return elWithMostSibs;
  }
  
  parsePageNum = (uri=window.location.href) => {
    try {
      const match = uri.match(/(?:(page|pg|p)\w*=)\d{1,2}/i);
      const pNum = match ? match.split('=')[1] : uri.split('/').find(p => p.match(/\d+/))
      console.log(uri, pNum || 1);
      return parseInt(pNum || 1) 
    } catch(e) {
      console.error('could not parse page number from: ', uri);
      return 1
    }
  }
  
  updatePageURIs = (html) => {
    const newURIs = $(html).find('[href]').map((_,el) => $(el).attr('href'))
      .toArray()
      .filter(href => this.parsePageNum(href))
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
  
  async loadMorePages(uris, attrSelectors, $container, maxPages=5) {
    const pendingUrls = uris.filter(u => !this.loadedUrls.includes(u));
    while (pendingUrls.length < 10) {
      const lastUrl = uris[uris.length-1];
      const lastPg = this.parsePageNum(lastUrl);
      const nextUrl = lastUrl.replace(new RegExp(`(=|/)(${lastPg})(&|$)`), ([delim]) => `${delim}${lastPg + 1}`)
      pendingUrls.push(nextUrl)
    }
    console.log('total items: before', $($container).find(attrSelectors).length);
    $('body').append(`<div id="loaderElement"></div>`);
    for (let uri of pendingUrls.slice(0, maxPages)) {
      await this.addPageResults(uri, attrSelectors, $container);
      console.log('total items: after', $($container).find(attrSelectors).length);
    }
    $('#loaderElement').remove();
  }
  
  applyFilters = (itemEl, attrSelectors) => {
    $(itemEl).parent().find(`${attrSelectors}, ${attrSelectors} *`).show()
    const searchItems = $(itemEl).parent().find(attrSelectors);
    console.log('filtering', this, searchItems);
    $('#totalResults').text($(searchItems).filter(":visible").length)
    $(searchItems).each((_,el) => {
      this.cssExclude.filter(v=>v).length && $(el).find(this.cssExclude).length && $(el).hide()
      this.searchExclude.filter(v=>v).length && this.searchExclude.some(se => el.innerText.toLowerCase().includes(se.toLowerCase())) && $(el).hide()
      this.searchInclude.filter(v=>v).length && !this.searchInclude.every(si => {
        return (typeof si === 'string')
          ? el.innerText.toLowerCase().includes(si.toLowerCase())
          : si.some(s => el.innerText.toLowerCase().includes(s.toLowerCase()))
      }) && $(el).hide()
    });
    $('#remainingResults').text($(searchItems).filter(":visible").length)
  }
}

function initFilter() {
  const $config = `
    <div id="fSearch">
      <label>include:</label> <input id="searchInclude" /> 
      <div id="searchIncludeList"></div>
      <label>exclude:</label> <input id="searchExclude" /> 
      <div id="searchExcludeList"></div>
      <label>exclude css:</label> <input id="cssExclude" />  
      <div id="cssExcludeList"></div>
      Total Items: <span id="totalResults"></span> 
      <br/>
      Remaining Items: <span id="remainingResults"></span>
      <br/>
      <button id="loadMore">Load More Results</button>
    </div>
  `
  $('body').append($($config));
  $('#searchInclude').val('[""]');
  $('#searchExclude').val('[""]');
  $('#fSearch').hide()
  const filterSort = new FilterSort();
  
  $( document ).on('keydown', function(k) {
    const {altKey, shiftKey, metaKey, ctrlKey, key} = k;
    if (altKey && metaKey && key.toLowerCase() === "å") {
      filterSort.run()
    }
  } );
  
}

