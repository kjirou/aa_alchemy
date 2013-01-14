// vim: set foldmethod=marker :
/**
 * AAlchemy
 *
 * @dependency Underscore.js v1.3.3 <http://underscorejs.org/>
 *             jQuery v1.8.3 <http://jquery.com/>
 */
var $e, $c, $f, $d, $a;


$e = {
    debug: true,
    mediaUrl: '.',
    jsdoitSize: [465, 496]
};


$c = {
  VERSION: '1.0.0',
  CSS_PREFIX: 'aal-'
};


/**
 * Functions
 */
$f = {};

$f.consoleLog = function(){
    if ('console' in this && 'log' in this.console) {
        try {
            return this.console.log.apply(this.console, arguments);
        } catch (err) {// For IE
            var args = Array.prototype.slice.apply(arguments);
            return this.console.log(args.join(' '));
        }
    }
}

$f.mixin = function(SubClass, superObj, SuperClass){
    var k;
    if (superObj !== undefined && superObj !== null) {
        for (k in superObj) {
            SubClass.prototype[k] = superObj[k]
        }
    }
    if (SuperClass !== undefined && SuperClass !== null) {
        for (k in SuperClass) {
            if (SuperClass.hasOwnProperty(k) && k !== 'prototype') {
                SubClass[k] = SuperClass[k]
            }
        }
    }
}
$f.inherit = function(SubClass, superObj, SuperClass){
    SubClass.prototype = superObj;
    SubClass.prototype.__myClass__ = SubClass;
    $f.mixin(SubClass, null, SuperClass);
}

/**
 * Return coordinates that is created by dividing large square by same small square
 *
 * @param partSize [width,height]
 * @param targetSize [width,height]
 * @param borderWidth default=0
 * @return arr [[top,left], ...], Order by 1) left to right 2) top to bottom
 */
$f.squaring = function(partSize, targetSize, borderWidth) {
    if (borderWidth === undefined) borderWidth = 0;
    var coords = [], top, left;
    for (top = 0; targetSize[1] >= top + partSize[1]; top += partSize[1] + borderWidth) {
        for (left = 0; targetSize[0] >= left + partSize[0]; left += partSize[0] + borderWidth) {
            coords.push([top, left]);
        }
    }
    return coords;
}

$f.escapeHTML = function(str){
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/&/g, '&amp;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#039;');
  return str;
}

$f.nl2br = function(str){
  return str.replace(/(?:\r\n|\n|\r)/g, '<br />');
}

$f.countLine = function(text){
  text = text.replace(/\r\n|\r/g, '\n');  // Normalize new line characters
  return text.split('\n').length;
}

$f.calculateMarginTopForCenteringMultilineText = function(
  lineCount, containerHeight, fontSize){
  var textHeight = fontSize * lineCount;
  return ~~((containerHeight - textHeight) / 2);
}

/** For jQuery.Deferred.then */
$f.wait = function(ms){
  return function(){
    var d = $.Deferred();
    setTimeout(function(){
      d.resolve();
    }, ms);
    return d;
  }
}

$f.argumentsToArray = function(args){
    var arr = [], i;
    for (i = 0; i < args.length; i += 1) { arr.push(args[i]) }
    return arr;
}

$f.ReceivableOptionsMixin = (function(){
    var cls = function(){
        this.__options = undefined;
    };
    cls.prototype.setOptions = function(options){
        this.__options = options || {};
    };
    cls.prototype.getOptions = function(/* args */){
        var self = this;

        var optionKeys = [];
        if (arguments.length === 1 && _.isArray(arguments[0])) {
            optionKeys = arguments[0];
        } else if (arguments.length > 0) {
            optionKeys = $f.argumentsToArray(arguments);
        }

        var i, extracted;
        if (optionKeys.length === 0) {
            return this.__options;
        } else {
            extracted = {};
            _.each(optionKeys, function(optionKey, i){
                if (optionKey in self.__options) {
                    extracted[optionKey] = self.__options[optionKey];
                }
            });
            return extracted;
        }
    };
    cls.prototype.getOption = function(key){
        return this.__options[key];
    };
    return cls;
}());


$d = function(){
    if ($e.debug === false) return;
    return $f.consoleLog.apply(this, arguments);
}


/**
 * Application
 */
$a = {
//{{{
  player: undefined,
  screen: undefined,
  statusbar: undefined,
  listbox: undefined,
  mixer: undefined,

  catchError: function(err){
    $d('error =', err);
    $d('error.stack =', err.stack);
  },
  fontSize: function(px){
    return px;
  }//,
//}}}
};


$a.Player = (function(){
//{{{
  var cls = function(){
  };

  function __INITIALIZE(self){
  };

  cls.create = function(){
    var obj = new this();
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.Sprite = (function(){
//{{{
    var cls = function(){
        this._view = undefined;
        this._pos = undefined;
        this._size = undefined;
        this._zIndex = 0;
        this._elementId = null;
        this._objectId = undefined;
    };
    $f.mixin(cls, new $f.ReceivableOptionsMixin());

    // Default settings, now this is used only for initialization
    cls.POS = [undefined, undefined];
    cls.SIZE = [undefined, undefined];

    var __CURRENT_OBJECT_ID = 1;
    var __OBJECTS = {};

    function __INITIALIZE(self){
        self._pos = self.__myClass__.POS.slice();
        self._size = self.__myClass__.SIZE.slice();

        self._objectId = __CURRENT_OBJECT_ID;
        if (self._elementId === null) {
            self._elementId = $c.CSS_PREFIX + 'sprite-' + self._objectId;
        }

        self._view = $('<div />').attr({ id:self._elementId }).addClass('sprite');

        __OBJECTS[self._elementId] = self;
        __CURRENT_OBJECT_ID += 1;
    };

    cls.prototype.draw = function(){
        this._view.css({
            // 'position:absolute' must not be defined in CSS.
            //   because jQuery.ui.draggable add 'position:relative' to it
            // Ref) jquery-ui-1.9.2.custom.js#L5495
            position: 'absolute',
            top: this.getTop(),
            left: this.getLeft(),
            width: this.getWidth(),
            height: this.getHeight(),
            zIndex: this._zIndex
        });
    };

    cls.prototype.drawZIndexOnly = function(zIndex){
        this._zIndex = zIndex;
        this._view.css({ zIndex:zIndex });
    };

    cls.prototype.getView = function(){ return this._view };

    cls.prototype.setPos = function(v){ this._pos = v };
    cls.prototype.getPos = function(){ return this._pos };
    cls.prototype.getTop = function(){ return this._pos[0] };
    cls.prototype.getLeft = function(){ return this._pos[1] };

    cls.prototype.setSize = function(v){ this._size = v };
    cls.prototype.getSize = function(){ return this._size };
    cls.prototype.getWidth = function(){ return this._size[0] };
    cls.prototype.getHeight = function(){ return this._size[1] };

    cls.prototype.setZIndex = function(v){ this._zIndex = v };

    cls.getByElementId = function(elementId){
        var obj = __OBJECTS[elementId];
        if (obj === undefined) throw new Error('Sprite.getByElementId: Not found object');
        return obj;
    }

    cls.create = function(options){
        var obj = new this();
        obj.setOptions(options);
        __INITIALIZE(obj);
        return obj;
    }

    return cls;
//}}}
}());


$a.Screen = (function(){
//{{{
  var cls = function(){
  };
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.ZINDEXES = {
    MIXER: 10//,
  };

  cls.POS = [0, 0];
  cls.SIZE = $e.jsdoitSize.slice(); // Must sync to CSS

  function __INITIALIZE(self){
    self._view.css({
      backgroundColor: '#EEE'
    });
  };

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.Statusbar = (function(){
//{{{
  var cls = function(){
    /** category:view sets */
    this._pageLinkViews = undefined;
  };
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.POS = [0, 0];
  cls.SIZE = [$a.Screen.SIZE[0], 34];

  function __INITIALIZE(self){
    self._view.css({
      backgroundColor: '#333'
    });

    self._mixButtonView = $('<div />')
      .addClass('mix_button')
      .css({
        position: 'absolute',
        top: 4,
        left: 4,
        width: 80,
        height: 26,
        lineHeight: '30px',
        fontSize: $a.fontSize(16)//,
      })
      .text('合成')
      .on('mousedown', { self:self }, __ONMIX)
      .appendTo(self.getView())
    ;

    self._remainingEmoticonView = $('<span />').css({
      marginLeft: 100,
      height: cls.SIZE[1] + 'px',
      lineHeight: cls.SIZE[1] + 'px',
      fontSize: $a.fontSize(14),
      color: '#FFF'//,
    }).appendTo(self.getView())

    self._pageLinksView = $('<div />').css({
      position: 'absolute',
      top: 0,
      right: 0,
      width: 180,
      height: '100%'//,
    }).appendTo(self.getView())

    self._pageLinkViews = {
      material: self._createPageLinkView('material', '素材'),
      common: self._createPageLinkView('common', 'コモン'),
      rare: self._createPageLinkView('rare', 'レア'),
      superrare: self._createPageLinkView('superrare', '超レア')//,
    };
    _.each(self._pageLinkViews, function(view){
      self._pageLinksView.append(view);
    });
  };

  cls.prototype._createPageLinkView = function(category, label){
    var self = this;
    return $('<a />')
      .addClass('page_link')
      .attr('href', 'javascript:void(0)')
      .css({
        lineHeight: cls.SIZE[1] + 'px',
        fontSize: $a.fontSize(12)
      })
      .text(label)
      .on('mousedown', {}, function(){
        $a.listbox.switchPage(category);
        $a.listbox.drawSwitchingPage();
        self.draw();
      })
    ;
  };

  cls.prototype.draw = function(){
    $a.Sprite.prototype.draw.apply(this);

    if ($a.emoticons.match() === null) {
      this._mixButtonView.removeClass('mix_button_active')
        .addClass('mix_button_inactive');
    } else {
      this._mixButtonView.removeClass('mix_button_inactive')
        .addClass('mix_button_active');
    }

    this._remainingEmoticonView.text(
      'あと ' + $a.emoticons.getNotFoundCount()  +  ' 体'
    );

    // Emphasise current page link
    _.each(this._pageLinkViews, function(view){
      view.removeClass('page_link_current');
    });
    this._pageLinkViews[$a.listbox.getCurrentCategory()].addClass('page_link_current')
  };

  function __ONMIX(evt){
    var self = evt.data.self;
    var matched = $a.emoticons.match();
    if (matched === null) return false;

    matched.isFound = true;
    $a.emoticons.resetSelects();

    $a.sounds.play('mix');
    $a.mixer.runMixing(matched.key);

    self.draw();
    $a.listbox.getCurrentPage().draw();

    return false;
  }

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.Listbox = (function(){
//{{{
  var cls = function(){
    this._currentCategory = undefined;
    this._pages = {};
  };
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  // Calulation:
  //   Max size = 465 x 465(496 - Startusbar)
  //   80 * 5 + 8 * 4 = 432
  //   (465 - 432) / 2 = 16.5
  //   top = 16.5 + 34 = 50.5
  //   left = 16.5
  cls.POS = [50, 16];
  cls.SIZE = [432, 432]

  function __INITIALIZE(self){
    self._view.css({
    });
  };

  cls.prototype.setPage = function(category){
    var obj = $a.Listpage.create(category)
    this._pages[category] = obj;
    this.getView().append(obj.getView());
  };

  cls.prototype.switchPage = function(category){
    this._currentCategory = category;
  };

  cls.prototype.getCurrentCategory = function(){
    return this._currentCategory;
  };

  cls.prototype.getCurrentPage = function(){
    return this._pages[this._currentCategory];
  };

  cls.prototype.draw = function(){
    $a.Sprite.prototype.draw.apply(this);
    this.drawSwitchingPage();
  };

  cls.prototype.drawSwitchingPage = function(){
    _.each(this._pages, function(page){
      page.getView().hide();
    });
    var page = this.getCurrentPage();
    page.draw();
    page.getView().show();
  };

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.Listpage = (function(){
//{{{
  var cls = function(){
    this._category = undefined;
    this._items = [];
  };
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.POS = [0, 0];
  cls.SIZE = $a.Listbox.SIZE.slice();
  cls.ITEM_COUNT = 25;

  function __INITIALIZE(self){

    self._initializeListitems();

    self._view
      .hide()
      .css({
      })
    ;
  };

  cls.prototype._initializeListitems = function(){
    var self = this;
    var emoticons = $a.emoticons.getDataList({ category:this._category });
    var positions = $f.squaring($a.Listitem.SIZE, this.getSize(), 8);
    _.times(cls.ITEM_COUNT, function(i){
      var emoticon = emoticons[i] || null;
      var item = $a.Listitem.create(emoticon);
      item.setPos(positions[i]);
      self._items.push(item);
      self.getView().append(item.getView());
    });
  };

  cls.prototype.draw = function(){
    $a.Sprite.prototype.draw.apply(this);
    _.each(this._items, function(item){
      item.draw();
    });
  };

  cls.create = function(category){
    var obj = $a.Sprite.create.apply(this);
    obj._category = category;
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.Listitem = (function(){
//{{{
  var cls = function(){
    /** Emoticon || null  */
    this._emoticon = undefined;
  };
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.POS = [0, 0];
  cls.SIZE = [80, 80];
  cls.ZINDEXES = {
    CLOSING_LINE: 100,
    TITLE: 10,
    ART_TEXT: 1
  };
  cls.ART_TEXT_FONT_SIZE = $a.fontSize(14);

  function __INITIALIZE(self){
    self._view
      .hide()
      .css({
        backgroundColor: '#FFF',
        cursor: 'pointer'
      })
      .on('mousedown', { self:self }, __ONMOUSEDOWN)
    ;

    self._closingLineView = $('<div />')
      .hide()
      .css({
        position: 'absolute',
        width: cls.SIZE[0] - 8,
        height: cls.SIZE[1] - 8,
        zIndex: cls.ZINDEXES.CLOSING_LINE,
        border: '4px solid #FF9933'//,
      })
      .appendTo(self._view)
    ;

    self._artTextView = $('<div />').css({
      width: '100%',
      lineHeight: 1.0,
      zIndex: cls.ZINDEXES.ART_TEXT,
      fontSize: cls.ART_TEXT_FONT_SIZE + 'px',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      //overflow: 'hidden',  // 入れると上の方が欠けてしまう
      color: '#000'//,
    }).appendTo(self._view);

    self._titleView = $('<div />').css({
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '16px',
      lineHeight: '16px',
      zIndex: cls.ZINDEXES.TITLE,
      fontSize: $a.fontSize(10) + 'px',
      textAlign: 'center',
      color: '#666'//,
    }).appendTo(self._view);
  };

  cls.prototype.draw = function(){

    if (this._emoticon === null) return;

    $a.Sprite.prototype.draw.apply(this);

    // Draw art with centering valign
    var artText = this._emoticon.artText;
    if (this._emoticon.isFound === false) artText = '？';
    var marginTop = $f.calculateMarginTopForCenteringMultilineText(
      $f.countLine(artText), cls.SIZE[1], cls.ART_TEXT_FONT_SIZE
    );
    this._artTextView.html($f.nl2br($f.escapeHTML(artText)))
      .css({ marginTop: marginTop });

    if (this._emoticon.isFound) {
      this._titleView.text(this._emoticon.emoticonName).show();
    } else {
      this._titleView.hide();
    };

    if (this._emoticon.isSelected) {
      this._closingLineView.show();
    } else {
      this._closingLineView.hide();
    };

    this.getView().show();
  };

  function __ONMOUSEDOWN(evt){
    var self = evt.data.self;
    if (self._emoticon.isSelectable === false) {
      return false;
    }
    self._emoticon.isSelected = !self._emoticon.isSelected;
    if (self._emoticon.isSelected) {
      $a.sounds.play('decide');
    } else {
      $a.sounds.play('cancel');
    }
    self.draw();
    $a.statusbar.draw();
    return false;
  };

  cls.create = function(emoticonOrNull){
    var obj = $a.Sprite.create.apply(this);
    obj._emoticon = emoticonOrNull;
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.Mixer = (function(){
//{{{
  var cls = function(){
  };
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.POS = [0, 0];
  cls.SIZE = $a.Screen.SIZE.slice();
  cls.ZINDEXES = {
    RARITY_AND_NAME: 10,
    ART_TEXT: 1
  }
  cls.ART_TEXT_FONT_SIZE = $a.fontSize(16);

  function __INITIALIZE(self){
    self.setZIndex($a.Screen.ZINDEXES.MIXER);
    self._view.css({
      backgroundColor: '#FFF'
    }).hide();

    self._rarityView = $('<div />')
      .hide()
      .css({
        position: 'absolute',
        top: 132,
        width: '100%',
        height: 32,
        lineHeight: '21px',
        fontSize: $a.fontSize(21),
        fontWeight: 'bold',
        zIndex: cls.ZINDEXES.RARITY_AND_NAME,
        textAlign: 'center',
        color: '#000'//,
      })
      .appendTo(self._view)
    ;

    self._artTextView = $('<div />')
      .hide()
      .css({
        width: '100%',
        fontSize: cls.ART_TEXT_FONT_SIZE,
        zIndex: cls.ZINDEXES.ART_TEXT,
        textAlign: 'center',
        color: '#000'//,
      })
      .appendTo(self._view)
    ;

    self._nameView = $('<div />')
      .hide()
      .css({
        position: 'absolute',
        top: 364,
        width: '100%',
        height: 32,
        lineHeight: '32px',
        fontSize: $a.fontSize(21),
        fontWeight: 'bold',
        zIndex: cls.ZINDEXES.RARITY_AND_NAME,
        textAlign: 'center',
        color: '#000'//,
      })
      .appendTo(self._view)
    ;
  };

  cls.prototype.runMixing = function(emoticonKey){
    var self = this;
    var emot = $a.emoticons.getData(emoticonKey);

    // Prepare drawing
    this._rarityView.text(
      $a.Emoticons.getCategoryLabel(emot.category)
    );
    this._nameView.text('『' + emot.emoticonName + '』');
    var marginTop = $f.calculateMarginTopForCenteringMultilineText(
      $f.countLine(emot.artText),
      cls.SIZE[1],
      cls.ART_TEXT_FONT_SIZE
    );
    this._artTextView.css({
      marginTop: marginTop
    }).html(
      $f.nl2br($f.escapeHTML(emot.artText))
    );

    return $.Deferred().resolve().then(function(){
      return self.getView().fadeIn(2000);
    }).then($f.wait(1000)).then(function(){
      $a.sounds.play('don');
      return self._rarityView.fadeIn(500);
    }).then($f.wait(1000)).then(function(){
      $a.sounds.play('don');
      return self._nameView.fadeIn(500);
    }).then($f.wait(1000)).then(function(){
      $a.sounds.play('don');
      return self._artTextView.fadeIn(500);
    }).then($f.wait(1000)).then(function(){
      return self.getView().fadeOut(2000);
    }).then(function(){
      self._rarityView.hide();
      self._artTextView.hide();
      self._nameView.hide();
    });
  }

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  };

  return cls;
//}}}
}());


$a.Sounds = (function(){
//{{{
  var cls = function(){
    this._players = {};
  }

  cls.SWF_PATH = 'http://code.kjirou.net/js/app/jsdoit/aa_alchemy/jQuery.jPlayer.2.1.0.source';
  cls.PLAYER_ID_PREFIX = 'jquery_jplayer-';

  function __INITIALIZE(self){
  }

  cls.prototype._createPlayerID = function(mediaKey){
    return cls.PLAYER_ID_PREFIX + mediaKey;
  }

  cls.prototype.setMedia = function(containerId, mediaKey, mediaType, url){
    var pid = this._createPlayerID(mediaKey);
    var jPlayer = $('<a />')
      .hide()
      .attr('id', pid)
      .jPlayer({
        swfPath: cls.SWF_PATH,
        ready: function(){
          var mediaData = {};
          mediaData[mediaType] = url;
          $(this).jPlayer('setMedia', mediaData);
        }//,
      })
      .appendTo('#' + containerId)
    ;
    $(containerId).append(jPlayer);
  }

  cls.prototype.play = function(mediaKey){
    var pid = this._createPlayerID(mediaKey);
    $('#' + pid).jPlayer('play');
  }

  cls.create = function(){
      var obj = new this();
      __INITIALIZE(obj);
      return obj;
  }

  return cls;
//}}}
}());


$a.Emoticons = (function(){
//{{{
  var cls = function(){
    this._data = {};
  }

  cls.CATEGORIES = [
    ['material', '素材'],
    ['common', 'コモン'],
    ['rare', 'レア'],
    ['superrare', '超レア']//,
  ];

  cls.__RAW_DATA = [
    ['material', 'nakaguro', [], '', '\u30fb'],
    ['material', 'shiromaru', [], '', '\u309c'],
    ['material', '^', [], '', '^'],
    ['material', 'T', [], '', 'T'],
    ['material', '-', [], '', '-'],
    ['material', 'kiri', [], '', '`\u00b4'],
    ['material', 'syun', [], '', '\u00b4`'],
    ['material', 'turna', [], '', '\u2200'],
    ['material', 'anguri', [], '', '\u0414'],
    ['material', 'huguri', [], '', '\u03c9'],
    ['material', '~', [], '', '\uff5e'],
    ['material', 'niyari', [], '', '\u30fc'],
    ['material', 'no', [], '', 'ノ'],
    ['material', 'tsu', [], '', 'つ'],
    ['material', 'm9', [], '', 'm9'],
    ['material', '!', [], '', '!'],
    ['material', ';', [], '', ';'],
    ['material', '(((', [], '', '((('],
    ['material', 'gan', [], '', '\u03a3'],
    ['material', '*', [], '', '*'],

    // Commons
    ['common', 'ii', ['nakaguro', 'turna'], 'イイ！', '(・∀・)'],
    ['common', 'ahya', ['shiromaru', 'turna'], 'アヒャ', '(ﾟ∀ﾟ)'],
    ['common', 'syakin', ['kiri', 'huguri'], 'シャキーン', '(｀･ω･´)'],
    ['common', 'syobon', ['syun', 'huguri'], 'ショボーン', '(´･ω･`)'],

    // Rares
    ['rare', 'joruju', ['shiromaru', 'turna', 'tsu'], 'ジョルジュ長岡',
      '　 _ 　∩\n(　ﾟ∀ﾟ)彡\n　⊂彡'],
  ];

  function __INITIALIZE(self){
    _.each(cls.__RAW_DATA, function(rawData, idx){
      self._addDataFromRawData(rawData, idx);
    });
  }

  cls.prototype._addDataFromRawData = function(rawData, order){
    var category = rawData[0];
    var key = rawData[1].toString();
    var materials = rawData[2].slice();
    if (key in this._data) {
      throw new Error('Emoticons._addDataFromRawData: Duplicated key');
    }
    this._data[key] = {
      key: key,
      order: order,
      category: category,
      materials: materials,
      emoticonName: rawData[3],
      artText: rawData[4],
      isFound: (materials.length === 0),
      isSelectable: (category === 'material'),
      isSelected: false//,
    };
  }

  cls.prototype.getDataList = function(conditions){
    conds = conditions || {};
    var category = conds.category || null;

    var filtered = _.filter(this._data, function(dat, id){
      if (category !== null && category !== dat.category) {
        return false;
      }
      return true;
    });
    return _.map(filtered, function(dat){
      return dat;
    }).sort(function(a, b){
      return parseInt(a.order, 10) - parseInt(b.order, 10);
    });
  }

  cls.prototype.getData = function(emoticonKey){
    return this._data[emoticonKey];
  }

  cls.prototype.getNotFoundCount = function(){
    return _.filter(this._data, function(dat){
      return dat.isFound === false;
    }).length;
  }

  cls.prototype._getSelectedKeys = function(){
    var filtered = _.filter(this._data, function(emoticon){
      return emoticon.isSelected;
    });
    return _.map(filtered, function(emoticon){
      return emoticon.key;
    });
  }

  cls.prototype.match = function(){
    var selectedKeys = this._getSelectedKeys();
    var matches = _.filter(this.getDataList(), function(data){
      if (
        data.isFound === false &&
        _.isEqual(selectedKeys.sort(), data.materials.sort())
      ) {
        return true;
      }
      return false;
    });
    if (matches.length === 0) return null;
    return matches[0];
  }

  cls.prototype.resetSelects = function(){
    _.each(this._data, function(emoticon){
      emoticon.isSelected = false;
    });
  }

  cls.getCategoryLabel = function(category){
    return _.find(cls.CATEGORIES, function(pair){
      if (category === pair[0]) return true;
    })[1];
  }

  cls.create = function(){
      var obj = new this();
      __INITIALIZE(obj);
      return obj;
  }

  return cls;
//}}}
}());


$a.init = function(){
//{{{

  $a.player = $a.Player.create();
  $a.emoticons = $a.Emoticons.create();
  $a.sounds = $a.Sounds.create();

  $a.screen = $a.Screen.create();
  $a.screen.draw();
  $('#game_container').append($a.screen.getView());

  $a.listbox = $a.Listbox.create();

  _.each($a.Emoticons.CATEGORIES, function(dataSet){
    $a.listbox.setPage(dataSet[0]);
  });

  $a.listbox.switchPage('material');
  $a.listbox.draw();
  $a.screen.getView().append($a.listbox.getView());

  // Must write after Listbox creation
  $a.statusbar = $a.Statusbar.create();
  $a.statusbar.draw();
  $a.screen.getView().append($a.statusbar.getView());

  $a.mixer = $a.Mixer.create();
  $a.mixer.draw();
  $a.screen.getView().append($a.mixer.getView());

//}}}
}


$(document).ready(function(){
  $a.init();

  $a.sounds.setMedia('game_container', 'decide', 'mp3',
    'http://code.kjirou.net/js/app/jsdoit/aa_alchemy/sounds/decide--button-3--b128-trim.mp3');
  $a.sounds.setMedia('game_container', 'cancel', 'mp3',
    'http://code.kjirou.net/js/app/jsdoit/aa_alchemy/sounds/cancel--button-47--b128-trim-speedup.mp3');
  $a.sounds.setMedia('game_container', 'mix', 'mp3',
    'http://code.kjirou.net/js/app/jsdoit/aa_alchemy/sounds/power14.mp3');
  $a.sounds.setMedia('game_container', 'don', 'mp3',
    'http://code.kjirou.net/js/app/jsdoit/aa_alchemy/sounds/crash10.mp3');
});
