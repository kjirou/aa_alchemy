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
  VERSION: '0.1.0',
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

$f.argumentsToArray = function(args){
    var arr = [], i;
    for (i = 0; i < args.length; i += 1) { arr.push(args[i]) }
    return arr;
}

$f.ReceivableOptionsMixin = (function(){
    var cls = function(){
        this.__options = undefined;
    }
    cls.prototype.setOptions = function(options){
        this.__options = options || {};
    }
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
    }
    cls.prototype.getOption = function(key){
        return this.__options[key];
    }
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
    listbox: undefined,

    catchError: function(err){
        $d('error =', err);
        $d('error.stack =', err.stack);
    }
//}}}
};


$a.Player = (function(){
//{{{
    var cls = function(){
    }

    function __INITIALIZE(self){
    }

    cls.create = function(){
        var obj = new this();
        __INITIALIZE(obj);
        return obj;
    }

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
    }
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
    }

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
    }

    cls.prototype.drawZIndexOnly = function(zIndex){
        this._zIndex = zIndex;
        this._view.css({ zIndex:zIndex });
    }

    cls.prototype.getView = function(){ return this._view }

    cls.prototype.setPos = function(v){ this._pos = v }
    cls.prototype.getPos = function(){ return this._pos }
    cls.prototype.getTop = function(){ return this._pos[0] }
    cls.prototype.getLeft = function(){ return this._pos[1] }

    cls.prototype.setSize = function(v){ this._size = v }
    cls.prototype.getSize = function(){ return this._size }
    cls.prototype.getWidth = function(){ return this._size[0] }
    cls.prototype.getHeight = function(){ return this._size[1] }

    cls.prototype.setZIndex = function(v){ this._zIndex = v }

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
  }
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.ZINDEXES = {
  };

  cls.POS = [0, 0];
  cls.SIZE = $e.jsdoitSize.slice(); // Must sync to CSS

  function __INITIALIZE(self){
    self._view.css({
      backgroundColor: '#EEE' // Tmp
    });
  }

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Statusbar = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.POS = [0, 0];
  cls.SIZE = [$a.Screen.SIZE[0], 34];

  function __INITIALIZE(self){
    self._view.css({
      backgroundColor: '#333' // Tmp
    });
  }

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Listbox = (function(){
//{{{
  var cls = function(){
    this._pages = {};
  }
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  // Calulation:
  //   Max size = 465 x 465(496 - Startusbar 34)
  //   64 * 6 + 10 * 5 = 434
  //   (465 - 434) / 2 = 15.5(top or left)
  //   top = 15.5 + 34 = 49.5
  //   left = 15.5
  cls.POS = [49, 15];
  cls.SIZE = [434, 434]

  function __INITIALIZE(self){
    self._view.css({
    });
  }

  cls.prototype.setPage = function(pageKey, data){
    var obj = $a.Listpage.create(data)
    this._pages[pageKey] = obj;
    this.getView().append(obj.getView());
    obj.draw();
  }

  cls.prototype.switchPage = function(pageKey){
    _.each(this._pages, function(page, pageKey){
      page.getView().hide();
    })
    this._pages[pageKey].getView().show();
  }

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Listpage = (function(){
//{{{
  var cls = function(){
    this._items = [];
  }
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.POS = [0, 0];
  cls.SIZE = $a.Listbox.SIZE.slice();
  cls.ITEM_COUNT = 36;

  function __INITIALIZE(self){

    self._initializeListitems();

    self._view
      .hide()
      .css({
      })
    ;
  }

  cls.prototype._initializeListitems = function(){
    var self = this;
    var positions = $f.squaring($a.Listitem.SIZE, this.getSize(), 10);
    _.times(cls.ITEM_COUNT, function(i){
      var item = $a.Listitem.create();
      item.setPos(positions[i]);
      self._items.push(item);
      self.getView().append(item.getView());
      item.draw();
      item.getView().show();
    });
  }

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.Listitem = (function(){
//{{{
  var cls = function(){
  }
  $f.inherit(cls, new $a.Sprite(), $a.Sprite);

  cls.POS = [0, 0];
  cls.SIZE = [64, 64]

  function __INITIALIZE(self){
    self._view
      .hide()
      .css({
        backgroundColor: '#FFF'
      })
    ;
  }

  cls.create = function(){
    var obj = $a.Sprite.create.apply(this);
    __INITIALIZE(obj);
    return obj;
  }

  return cls;
//}}}
}());


$a.init = function(){
//{{{

  $a.player = $a.Player.create();

  $a.screen = $a.Screen.create();
  $a.screen.draw();
  $('#game_container').append($a.screen.getView());

  $a.statusbar = $a.Statusbar.create();
  $a.statusbar.draw();
  $a.screen.getView().append($a.statusbar.getView());

  $a.listbox = $a.Listbox.create();

  // Materials
  $a.listbox.setPage('material', {
  });

  // Commons
  $a.listbox.setPage('common', {
  });

  // Rares
  // Extra rares
  // Super rares

  $a.listbox.switchPage('material');
  $a.listbox.draw();
  $a.screen.getView().append($a.listbox.getView());

//}}}
}


$(document).ready(function(){
  $a.init();
});
