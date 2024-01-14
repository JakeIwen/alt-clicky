
$(function() { 
  !function(n){var e={delay:50,duration:5e3};n.fn.sfFlash=function(t){var a=n.extend(e,t),d=this;n(document).on("DOMSubtreeModified",function(){d=n(d.selector),o()});var o=function(){d&&(window.setTimeout(function(){d.show().addClass("fadeInUp animated")},a.delay),window.setTimeout(function(){d.addClass("fadeOutDown animated")},a.duration))};o()}}(jQuery);
  $('.sf-flash').sfFlash()
  
  jq()
  initAltClick();
  amzn();
  // ebay();
  tndr();
  fcbk();
  ipt()
  initFilter();
  gt();
  qbit();
  
})
const {host, href} = location

// if (window.location.host.includes('quickbase.com')) qb();
function flmsg(msg) {
  $('body').append(`<div class="sf-flash">${msg}</div>`)
}

function qbit() {
  if (location.hostname != "vanpi.local") return
  qbitTitle()
}

function gt() {
  if (!host.includes('ultimate-guitar')) return
  const copyToClip = () => {
    $('main').children().first().remove()
    navigator.clipboard.writeText($('code').text())
    flmsg('CHORDS COPIED!')
  }
  arriveObserver(copyToClip, 'code')
}

function jq() {
  var jqScriptTag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>'
  var devtools = function() {}
  devtools.toString = function() {
    if (!this.opened && $.toString().includes('[native code]')) {
      console.log('appending jq');
      $('head').append(jqScriptTag)
    }
    this.opened = true;
  }
  console.log('%c', devtools);
}

async function ipt() {
  if (!host.includes('iptorrents.com')) return;
  $('.tmS').remove()
  const keyDown = (kd) => {
    const {target, keyCode} =  kd
    
    if (keyCode === 32) {
      const val0 = $(target).val()
      if(val0.match(/ (\d\d)(\d\d)$/)) {
        $(target).val(val0.replace(/ (\d\d)(\d\d)$/, ' S$1E$2 '));
        console.log('repl4digit');
      } else if(val0.match(/ (\d)(\d\d)$/)) {
        $(target).val(val0.replace(/ (\d)(\d\d)$/, ' S0$1E$2 '));
        console.log('repl3digit');
      }
    }
    // $(target).val(val0.replace(/ (\d\d)-(\d\d) $/, ' S0$1E$2 '));
  }
  $( 'input[type="search"]' ).keydown( keyDown );
}

async function amzn() {
  
  if (!host.includes('amazon.com')) return;
  // always smile.amazon.com
  if (host == 'amazon.com') {
    return location.href = href.replace(/https:\/\/www.amazon\.com/, 'https://smile.amazon.com')
  }
  // prevent subscription default
  $('#newAccordionRow').find(':contains("One-time purchase:")').last().click();
  // sort revierws by recent 
  $('#cm-cr-sort-dropdown').children().removeAttr('selected').last().attr('selected', true)
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

function arriveObserver(callback, selector) {
  const observer = new MutationObserver( () => {
    const waldo = $(selector);
    if (waldo.length) {
      observer.disconnect();
      return callback(waldo)
    }
  })
  observer.observe($('body')[0], { attributes: true, subtree: true });
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
  
  const feedAdSelector = 'a[href*="/ads/about"]'
  const adSelector = 'a[href][aria-labelledby][rel="nofollow noopener"]'
  const cbk = (mutation) => { 
    let $tgt = $(mutation.target);
    if ($tgt[0].tagName !== 'DIV') return;
    let ads = [
      ...$tgt.find(adSelector).toArray(), 
      ...$tgt.find(feedAdSelector).toArray().map(e => $(e).closest('[role="feed"] > div'))
    ]
    
    if(ads.length) {
      console.log('removing on ad', $tgt, ads);
      $(ads).remove();
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
    console.log({hasOtherModKey});
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

async function qbitTitle() {
  setInterval(() => {
    const t = document.getElementsByTagName('title')[0];
    if (t.innerText.startsWith('qbit')) return;
    
    const downSpd = document.getElementById('DlInfos').innerText;
    const upSpd = document.getElementById('UpInfos').innerText;
    t.innerText = `qbit [${downSpd.split('(')[0]}]|[${upSpd.split('(')[0]}]`;
    
  }, 250)
}

// mode(['pear', 'apple', 'orange', 'apple']); // apple

class FilterSort {
  
  constructor() {
    this.urlList = [];
    this.pMap = {}
    this.pageIndex = 1;
    this.loadedUrls = [];
    this.options = {};
    this.initComplete = false;
    this.curPageNum = null;
    this.searchInclude = [];
    this.searchExclude = [];
    this.cssExclude = [];
    $('#searchInclude').on('change submit', (e) => {
      this.searchInclude = JSON.parse(this.wrapQuotes(e.target.value));
      $('#searchIncludeList').text(JSON.stringify(this.searchInclude))
      this.applyFilters(this.itemEl, this.attrSelectors)
    })
    $('#searchExclude').on('change submit', (e) => {
      this.searchExclude = JSON.parse(this.wrapQuotes(e.target.value));
      $('#searchExcludeList').text(JSON.stringify(this.searchExclude))
      this.applyFilters(this.itemEl, this.attrSelectors)
    })
    $('#cssExclude').on('change submit', (e) => {
      this.cssExclude = $('#cssExcludeList').text();
      this.applyFilters(this.itemEl, this.attrSelectors);
    })
    $('#loadMore').click( async () => {
      if(!this.pMap[1]) this.updatePageURIs();
      await this.loadMorePages();
      this.applyFilters(this.itemEl, this.attrSelectors);
    })
  }
  
  init() {
    const initl = $('.mouseOn')[0];
    if (!initl) return console.log('night element with alt, then press ctrl & meta too ');
    
    this.itemEl = this.getItemElement(initl);
    this.parentEl = $(this.itemEl).parent()
    const parentAttr = this.getAttrSelectors(this.itemEl.parentElement);
    const itemAttr = this.getAttrSelectors(this.itemEl);
    this.attrSelectors = `${parentAttr} > ${itemAttr}`;
    this.curPageNum = this.curPageNum || this.parsePageNum();
    $('#fSearch').show()
    $('#searchInclude').focus()
    this.initComplete = true;
  }
  
  wrapQuotes = (txt) => txt.replace(/((\w|-|\.)+)/g, '"$1"')

  getAttrSelectors = el => {
    return el.tagName.toLowerCase() + this.getClassSelector(el) + 
      Array.from(el.attributes).map(a => `[${a.name}]`).slice(0,3).join('');
  }
  
  getClassSelector = (el) => {
    if (!el.className) return '';
    return '.' + el.className.split(' ')[0] //.join('.')
  }
  
  run() {
    if (!this.initComplete) this.init();
    this.applyFilters(this.itemEl, this.attrSelectors)
  }

  getNumSiblings = $source => {
    const tagName = $source[0].tagName;
    const classes = Array.from($source[0].classList);
    const cSelec = classes.length ? `.${classes[0]}` : '';
    return $source
      .siblings(`${tagName}${cSelec}`)
      // .not('[id]')
      .not('[cel_widget_id]')
      .length;
    // return $source.siblings(tagName).length;
  }

  getItemElement = (initl) => {
    // let cur = document.elementFromPoint(parseInt(x),parseInt(y))
    let elWithMostSibs = null;
    let mostSibs = 0;
    let cur = $(initl);
    do {
      const numSibs = this.getNumSiblings(cur);
      console.log({numSibs, cur});
      if (numSibs > mostSibs) {
        mostSibs = numSibs;
        elWithMostSibs = cur[0];
      }
      cur = $(cur).parent();
    } while ($(cur).parent().length);
    return elWithMostSibs;
  }
  
  // function pn() {
  //   var n;
  //   var uri = window.location.href.split('#')[0].replace(new RegExp(`.*${location.host}?/`), '');
  //   if (uri.match(/^\d{1,3}$/)) {n = uri.match(/^\d+$/)}
  //   else {
  //     var match = uri.match(/(?:(page|pg|p)\w*=)(\d{1,3})/i);
  //     var pNum = match ? match[2] : uri.match(/(\W|_)(\d{1,3})$/)[2];
  //     n = (pNum ? parseInt(pNum) : 0).toString();
  //   }
  //   location.href.replace(new RegExp(`(${n})(\W|$)`), (_,nm,d) => (parseInt(nm) + 1) + d);
  //   // location.href = location.href.replace(new RegExp(`(${n})(\W|$)`), ([_,nm,d]) => (parseInt(nm) + 1) + d);
  // }
  // 
  parsePageNum = (uri=location.href) => {
    try {
      uri = uri.split('#')[0].replace(location.host, '');
      if (uri.match(/^\d{1,3}$/)) return uri.match(/^\d+$/);
      var match = uri.match(/(?:(page|pg|p)\w*=)(\d{1,3})/i);
      var pNum = match ? match[2] : uri.match(/(\W|_)(\d{1,3})$/)[2];
      if (!pNum) console.log(`could not parse pagenum, falling back to 0. for: ${uri}`);
      
      return pNum ? parseInt(pNum) : 0;
    } catch(e) {
      return 0
    }
  }
  
  filterSeq = (items, ...regexes) => {
    for (var regex of regexes) {
      if (items.some(u => u.match(regex))) return items.filter(u => u.match(regex));
    }
    return items
  }
  
  uniquePages = uris => {
    return uris.reduce((acc,cur) => {
      const pgNum = this.parsePageNum(cur);
      if (!acc.some(url => pgNum === this.parsePageNum(url))) acc.push(cur);
      return acc;
    }, [])
      .sort((a,b) => this.parsePageNum(a) > this.parsePageNum(b));
  }
  
  updatePageURIs = () => {
    let uris = Array.from(document.getElementsByTagName('a')).map(a => a.href)
      .filter(href => href.replace(new RegExp(`.*${location.host}`), '').match(/\d/))
      .map(u => u.startsWith('/') ? `${location.origin}${u}` : u);
    uris = this.filterSeq(uris, /page=\d/, /p=\d/, /pg=\d/, /\/\d+$/)
    uris = this.uniquePages(uris)
    
    this.pMap = this.buildPmap(uris[uris.length - 1]);
  }
  
  buildPmap = exampleUrl => {
    const pMap = {}
    const exPageNum = this.parsePageNum(exampleUrl)
    if (!exPageNum) throw new Error('could not parse page num')
    for (var i = 1; i < 200; i++) {
      const newURI = exampleUrl.replace(new RegExp(`(=|/)${exPageNum}(&|/|$)`), (_, g1, g2) => `${g1}${i}${g2}`);
      pMap[i] = newURI
    }
    return pMap;
  }
  
  // pairs = s.match(/\[.*\]/g).map(s => '[' + s.slice(1,-1).split(',').map(z => `"${z.trim()}"`).join(',') + ']')
  
  addPageResults = (uri) => {
    if (this.loadedUrls.includes(uri)) return console.log('already included', uri);
    
    return new Promise((resolve) => {
      $.get(uri).then((data) => {
        const newEls = $(data).find(`${this.attrSelectors},script`).toArray();
        const {scriptEls, regEls} = newEls.reduce((acc,el) => {
          el.tagName==='SCRIPT' ? acc.scriptEls.push(el) : acc.regEls.push(el);
          return acc;
        }, {scriptEls: [], regEls: []})
        
        if (!regEls.length) {
          console.log('no real elements found for ', uri);
          resolve();
        }
        
        regEls.map(el => this.itemEl.parentElement.appendChild(el));
        
        scriptEls.map(el => {
          const scr = document.createElement('script');
          scr.innerHTML = el.innerHTML;
          this.itemEl.parentElement.appendChild(scr)
        });
        
        this.loadedUrls.push(uri);
        this.curPageNum = this.parsePageNum(uri);
        resolve()
      })
    })
  }
  
  async loadMorePages(numPagesToLoad=10) {

    $('body').append(`<div id="loaderElement"></div>`);
    const urls = Object.values(this.pMap);
    for (let uri of urls.slice(this.pageIndex, this.pageIndex + numPagesToLoad)) {
      console.log('loading ' + uri);
      await this.addPageResults(uri);
    }
    this.pageIndex += numPagesToLoad
    
    $('[data-src]').each(function() {
      if(!this.src || this.src.includes('blank')) this.src = $(this).attr('data-src')
    })
    $('#loaderElement').remove();
  }
  
  applyFilters = (itemEl, attrSelectors) => {
    $(`${attrSelectors}`).show()
    // const searchItems = $(itemEl).parent().parent().find(`${attrSelectors}`);
    const searchItems = $(itemEl).siblings();
    $(searchItems).each((_,el) => {
      this.cssExclude.filter(v=>v).length && $(el).find(this.cssExclude).length && $(el).hide()
      this.searchExclude.filter(v=>v).length && this.searchExclude.some(se => el.innerText.toLowerCase().includes(se.toLowerCase())) && $(el).hide()
      this.searchInclude.filter(v=>v).length && !this.searchInclude.every(si => {
        return (typeof si === 'string')
          ? el.innerText.toLowerCase().includes(si.toLowerCase())
          : si.some(s => el.innerText.toLowerCase().includes(s.toLowerCase()))
      }) && $(el).hide()
    });
    $('#totalResults').text(() => {
      const tot = $(this.itemEl).parent().parent().find(this.attrSelectors).length;
      const vis = $(itemEl).parent().parent().find(`${attrSelectors}:visible`).length;
      return `Filtered ${tot - vis} of about ${tot}`
    })
  }
}

function initFilter() {
  $('#fSearch').remove();
  const $config = `
    <div id="fSearch">
      <div>
        <div id="closefilt">X</div>
        <label>include:</label> <input style="background-color: initial; color: initial;" id="searchInclude" /> 
        <div id="searchIncludeList"></div>
        <label>exclude:</label> <input style="background-color: initial; color: initial;" id="searchExclude" /> 
        <div id="searchExcludeList"></div>
        <label>exclude css:</label> <input style="background-color: initial; color: initial;" id="cssExclude" />  
        <div id="cssExcludeList"></div>
        <span id="totalResults"></span> 
        <br/>
        Remaining Items: <span id="remainingResults"></span>
        <br/>
        <button id="loadMore">Load More Results</button>
      </div>
    </div>
  `
  $('body').append($config);
  $('#searchInclude').val('[]');
  $('#searchExclude').val('[]');
  $('#fSearch').hide()
  $('#closefilt').click(() => initFilter())
  const filterSort = new FilterSort();
  
  console.log('FILT INITIALIZED');
  $( document ).keydown(function(k) {
    const {altKey, metaKey, ctrlKey, key, } = k;
    if (ctrlKey && altKey && metaKey) {
      k.preventDefault()
      console.log('keyspressed');
      filterSort.run()
    }
  } );
  
}

// $( document ).keydown(function(k) {
//   console.log(k);
//   const {altKey, metaKey, ctrlKey, keyCode} = k;
//   if (altKey && ctrlKey && keyCode === 66) {
//     k.preventDefault()
//     console.log(chrome.bookmarks);
//     debugger;
//   }
// } );
