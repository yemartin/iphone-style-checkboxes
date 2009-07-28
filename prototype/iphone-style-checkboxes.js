var iPhoneStyle = function(selector_or_elems, options) {
  options = Object.extend(Object.clone(iPhoneStyle.defaults), options || {});
  var elems;
  if (Object.isString(selector_or_elems)) {
    elems = $$(selector_or_elems);
  } else {
    elems = [selector_or_elems].flatten();
  }
  return elems.each(function(elem) {
    
    if (!elem.match('input[type=checkbox]')) {
      return;
    }
    
    elem.setOpacity(0);
    elem.wrap('div', { 'class': options.containerClass});
    elem.insert({ 'after': '<div class="' + options.handleClass + '"><div class="' + options.handleRightClass + '"><div class="' + options.handleCenterClass + '" /></div></div>' })
        .insert({ 'after': '<label class="' + options.labelOffClass + '"><span>'+ options.uncheckedLabel + '</span></label>' })
        .insert({ 'after': '<label class="' + options.labelOnClass + '"><span>' + options.checkedLabel   + '</span></label>' });
    
    var handle    = elem.up().down('.' + options.handleClass),
      offlabel  = elem.adjacent('.' + options.labelOffClass).first(),
      offspan   = offlabel.down('span'),
      onlabel   = elem.adjacent('.' + options.labelOnClass).first(),
      onspan    = onlabel.down('span'),
      container = elem.up('.' + options.containerClass);
      
    if (options.resizeHandle) {
      var min = (onlabel.getWidth() < offlabel.getWidth()) ? onlabel.getWidth() : offlabel.getWidth();
      handle.setStyle({width: min - 8 + 'px'});
    }
    if (options.resizeContainer) {
      var max = (onlabel.getWidth() > offlabel.getWidth()) ? onlabel.getWidth() : offlabel.getWidth();
      container.setStyle({width: max + handle.getWidth() + 12 + 'px'});
    }
    offlabel.setStyle({width: container.getWidth() - 12  + 'px'});

    var rightside = container.getWidth() - handle.getWidth() - 4;

    if (elem.checked) {
      handle.setStyle({ left: rightside + 'px' });
      onlabel.setStyle({ width: rightside + 'px' });
      offspan.setStyle({ 'marginRight': rightside + 'px' });
    } else {
      handle.setStyle({ left: 0 });
      onlabel.setStyle({ width: 0 });
      onspan.setStyle({ 'marginLeft': -rightside + 'px' });
    }    

    elem.change = function() {
      var is_onstate = elem.checked;
      var p = handle.positionedOffset().first() / rightside;
      new Effect.Tween(null, p, (is_onstate) ? 1 : 0, { duration: options.duration / 1000 }, function(p) {
        handle.setStyle({ left: p * rightside + 'px' });
        onlabel.setStyle({ width: p * rightside + 'px' });
        offspan.setStyle({ 'marginRight': -p * rightside + 'px' });
        onspan.setStyle({ 'marginLeft': -(1 - p) * rightside + 'px' });
      });
    };
    
    document.observe('mouseup', function(e) {
      if (iPhoneStyle.clicking == handle) {
        if (!iPhoneStyle.dragging) {
          var is_onstate = elem.checked;
          elem.writeAttribute('checked', !is_onstate);
        } else {
          var p = (Event.pointerX(e) - iPhoneStyle.dragStartPosition) / rightside;
          elem.writeAttribute('checked', (p >= 0.5));
        }
        iPhoneStyle.clicking = null;
        iPhoneStyle.dragging = null;
        elem.change();
      }
      return false;
    });

    document.observe('mousemove', function(e) {
      if (iPhoneStyle.clicking == handle) {
        if (Event.pointerX(e) != iPhoneStyle.dragStartPosition) {
          iPhoneStyle.dragging = true;
        }
        var p = (Event.pointerX(e) - iPhoneStyle.dragStartPosition) / rightside;
        if (p < 0) { p = 0; }
        if (p > 1) { p = 1; }
        handle.setStyle({ left: p * rightside + 'px' });
        onlabel.setStyle({ width: p * rightside + 'px' });
        return false;
      }
    });
    
    container.observe('mousedown', function(e) {
      iPhoneStyle.clicking = handle;
      iPhoneStyle.dragStartPosition = Event.pointerX(e) - handle.viewportOffset().first() + 8;
      Event.stop(e);
      return false;
    });
    
    // Disable text selection
    // [container, onlabel, offlabel, handle].invoke('observe', 'mousedown', function(e) { Event.stop(e); return false; });
    if (Prototype.Browser.IE) {
      [container, onlabel, offlabel, handle].invoke('observe', 'startselect', function(e) { Event.stop(e); return false; });
    }
  });
};

iPhoneStyle.defaults = {
  duration:          200,
  checkedLabel:      'ON', 
  uncheckedLabel:    'OFF', 
  resizeHandle:      true,
  resizeContainer:   true,
  background:        '#fff',
  containerClass:    'iPhoneCheckContainer',
  labelOnClass:      'iPhoneCheckLabelOn',
  labelOffClass:     'iPhoneCheckLabelOff',
  handleClass:       'iPhoneCheckHandle',
  handleCenterClass: 'iPhoneCheckHandleCenter',
  handleRightClass:  'iPhoneCheckHandleRight'
};
