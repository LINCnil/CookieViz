/*
 * jQuery.scrollableTable
 * 
 * Clones a table and places its headers only above the containing element to provide
 * a scrollable table while the headers do not move.
 * 
 * @version 1.0
 * @author David Parker [davidwparker(at)gmail(dot)com]
 * @copyright Copyright (c) 2009 David Parker
 * @license MIT
 * @demo: http://davidwparker.com/
 *
 * @function moveHeaders(options)
 * @param    options object - type: thead or th
 * @return   jQuery  object
 *
 * @note: ensure that element (div) surrounding the table has the following styles:
 *    overflow-y:scroll;
 *    height:XXXpx;
 *  to get the desired effect.
 */
(function($){
$.fn.extend({
  scrollableTable: function(opts){
    var defaults = {
      cloneClass:"cloned",
      type:"thead"
    }, o = $.extend({}, defaults, opts);

    return this.each(function(){
      var $this = $(this), $clone = $this.clone();
      if (o.type === "thead")
        $this.find(o.type).remove();
      else if(o.type === "th")
        $this.find(o.type).parent("tr").remove();
      $this.find("tr:first td").each(function(i){
          var w = $(this).width();
          $clone.find("tr:first th").each(function(j){
            if (i === j){
              $(this).width(w);
            }
          });
        });
      var width = $this.width();
      $clone.addClass(o.cloneClass).width(width+2)
        .find("tr:not(:first)").remove().end()
        .insertBefore($this.parent());
    });
  }
});
})(jQuery);