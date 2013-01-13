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
};

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
};
$f.inherit = function(SubClass, superObj, SuperClass){
    SubClass.prototype = superObj;
    SubClass.prototype.__myClass__ = SubClass;
    $f.mixin(SubClass, null, SuperClass);
};

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
};

$f.argumentsToArray = function(args){
    var arr = [], i;
    for (i = 0; i < args.length; i += 1) { arr.push(args[i]) }
    return arr;
};

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
};


/**
 * Application
 */
$a = {
//{{{
  player: undefined,
  screen: undefined,
  listbox: undefined,

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
  };

  cls.POS = [0, 0];
  cls.SIZE = $e.jsdoitSize.slice(); // Must sync to CSS

  function __INITIALIZE(self){
    self._view.css({
      backgroundColor: '#EEE' // Tmp
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
    this._mixButtonView.addClass('mix_button_inactive');

    this._remainingEmoticonView.text(
      'あと ' + $a.emoticons.getNotFoundCount()  +  ' 体'
    );

    // Emphasise current page link
    _.each(this._pageLinkViews, function(view){
      view.removeClass('page_link_current');
    });
    this._pageLinkViews[$a.listbox.getCurrentCategory()].addClass('page_link_current')
  };

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
    TITLE: 10,
    ART_TEXT: 1
  };

  function __INITIALIZE(self){
    self._view
      .hide()
      .css({
        backgroundColor: '#FFF',
        cursor: 'pointer'
      })
    ;

    self._artTextView = $('<div />').css({
      width: '100%',
      height: cls.SIZE[1] + 'px',
      lineHeight: cls.SIZE[1] + 'px',
      zIndex: cls.ZINDEXES.ART_TEXT,
      fontSize: $a.fontSize(16) + 'px',
      textAlign: 'center',
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

    if (this._emoticon.isFound) {
      this._artTextView.text(this._emoticon.artText);
      this._titleView.text(this._emoticon.emoticonName);
    } else {
      this._artTextView.text('\uff1f');
      this._titleView.hide();
    };

    this.getView().show();
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


$a.Emoticons = (function(){
//{{{
  var cls = function(){
    this._data = {};
  };

  cls.__RAW_DATA = [
    // なかぐろ
    ['material', 1, [], '', '\u30fb'],
    // 白丸
    ['material', 2, [], '', '\u309c'],
    // ^
    ['material', 3, [], '', '^'],
    // なき
    ['material', 4, [], '', 'T'],
    // 伏し目
    ['material', 5, [], '', '-'],
    // きりっ
    ['material', 6, [], '', '`\u00b4'],
    // しゅん
    ['material', 7, [], '', '\u00b4`'],
    // ターンエー
    ['material', 11, [], '', '\u2200'],
    // への字口
    ['material', 12, [], '', '\u0414'],
    // ふぐり
    ['material', 13, [], '', '\u03c9'],
    // 〜
    ['material', 14, [], '', '\uff5e'],
    // ニヤリ
    ['material', 15, [], '', '\u30fc'],
    // ノ
    ['material', 31, [], '', 'ノ'],
    // ゆびさし
    ['material', 32, [], '', 'm9'],
    // ！
    ['material', 51, [], '', '!'],
    // 汗
    ['material', 52, [], '', ';'],
    // がーん
    ['material', 53, [], '', '((('],
    // がくがく
    ['material', 54, [], '', '\u03a3'],
    // ぽっ
    ['material', 55, [], '', '*'],

    // Commons
    ['common', 101, [1, 11], 'イイ！', '(・∀・)'],
  ];

  function __INITIALIZE(self){
    _.each(cls.__RAW_DATA, function(rawData){
      self._addDataFromRawData(rawData);
    });
  };

  cls.prototype._addDataFromRawData = function(rawData){
    var id = rawData[1].toString();
    var materialIds = rawData[2].slice();
    if (id in this._data) {
      throw new Error('Emoticons._addDataFromRawData: Duplicated id');
    }
    this._data[id] = {
      id: id,
      category: rawData[0],
      materialIds: materialIds,
      emoticonName: rawData[3],
      artText: rawData[4],
      isFound: (materialIds.length === 0)//,
    };
  };

  cls.prototype.getDataList = function(conditions){
    var category = conditions.category || null;

    var filtered = _.filter(this._data, function(dat, id){
      if (category !== null && category !== dat.category) {
        return false;
      }
      return true;
    });
    return _.map(filtered, function(dat){
      return dat;
    }).sort(function(a, b){
      return parseInt(a.id, 10) - parseInt(b.id, 10);
    });
  };

  cls.prototype.getNotFoundCount = function(){
    return _.filter(this._data, function(dat){
      return dat.isFound === false;
    }).length;
  };

  cls.create = function(){
      var obj = new this();
      __INITIALIZE(obj);
      return obj;
  };

  return cls;
//}}}
}());


$a.init = function(){
//{{{

  $a.player = $a.Player.create();
  $a.emoticons = $a.Emoticons.create();

  $a.screen = $a.Screen.create();
  $a.screen.draw();
  $('#game_container').append($a.screen.getView());

  $a.listbox = $a.Listbox.create();

  var categories = [
    'material',
    'common',
    'rare',
    'superrare'//,
  ];
  _.each(categories, function(category){
    $a.listbox.setPage(category);
  });

  $a.listbox.switchPage('material');
  $a.listbox.draw();
  $a.screen.getView().append($a.listbox.getView());

  // Must write after Listbox creation
  $a.statusbar = $a.Statusbar.create();
  $a.statusbar.draw();
  $a.screen.getView().append($a.statusbar.getView());

//}}}
}


$(document).ready(function(){
  $a.init();
});
