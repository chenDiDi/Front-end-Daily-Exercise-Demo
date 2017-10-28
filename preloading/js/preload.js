// 图片预加载  js是没有局部作用域的，通过使用闭包来模拟局部作用域
(function ($) {
    // 构造函数
    function Preload(imgs, options) {
        this.imgs = (typeof imgs === 'string') ? [imgs] : imgs;
        this.opts = $.extend({}, Preload.DEFAULTS, options);
        // _函数只在内部调用
        if (this.opts.order === "unordered") {
            this._unordered();
        } else {
            this._ordered();
        }
    }
    Preload.DEFAULTS = {
        order: "unordered",  //是否为有序预加载
        each: null,  // 每一张图片加载完毕之后执行
        all: null  // 所有图片加载完毕之后执行
    };
    Preload.prototype._ordered = function () {     // 有序加载
        var imgs = this.imgs,
            opts = this.opts,
            count = 0,
            len = imgs.length;

        load();

        function load () {
            console.log(count, len);
            var imgObj = new Image();
            $(imgObj).on('load error', function () {
                opts.each && opts.each(count);  // 先判断each存不存在，存在则执行
                if (count >= len) {
                    opts.all && opts.all();
                } else {
                    console.log("load");
                    load();
                }
                console.log("++");
                count++;
            });
            imgObj.src = imgs[count];
            
        }
    };
    Preload.prototype._unordered = function () {  // 无序加载
        var imgs = this.imgs,
            opts = this.opts,
            count = 0,
            len = imgs.length;
        $.each(imgs, function (i, src) {
            if (typeof src !== 'string') return;
			var imgObj = new Image();

			$(imgObj).on('load error', function () {
				opts.each && opts.each(count);  // 先判断each存不存在，存在则执行
				if (count >= len-1) {
					opts.all && opts.all();
				}
				count++;
			});
			imgObj.src = src;
		});
    };
    // 面向对象如何变成一个插件呢，有两种方法
    // $.fn.extend -> $('#img').preload()   // 绑定在$.fn上的，调用方式是先选择一个元素
    // $.extend -> $.preload();  // 工具函数,工具方法
    $.extend({
        preload: function (imgs, opts) {
            new Preload(imgs,opts);
        }
    })

})(jQuery);   // 一个局部作用域
