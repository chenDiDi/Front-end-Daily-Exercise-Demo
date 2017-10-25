;(function ($) {
    var LightBox = function (setting) {
        this.settings = {
            speed: 500,   // 配置的速度参数
            scale: 1      // 放大缩小倍数
        };
        $.extend(this.settings, setting || {});
        var self = this;
        //创建遮罩和弹出层
        this.popupMask = $('<div id="G-lightbox-mask">');
        this.popupWin = $('<div id="G-lightbox-popup">');

        //保存body
        this.bodyNode = $(document.body);

        //渲染剩余的dom，并且插入到body
        this.renderDOM();

        // 获取数据
        this.picViewArea = this.popupWin.find('div.lightbox-pic-view'); //图片预览区域
        this.popupPic = this.popupWin.find('img.lightbox-image');  //图片
        this.picCaptionArea = this.popupWin.find('div.lightbox-pic-caption'); // 图片描述区域
        this.nextBtn = this.popupWin.find('span.lightbox-next-btn');
        this.prevBtn = this.popupWin.find('span.lightbox-prev-btn');
        this.captionText = this.popupWin.find('p.lightbox-pic-desc'); //图片描述
        this.currentIndex = this.popupWin.find('span.lightbox-of-index');  // 图片当前索引
        this.closeBtn = this.popupWin.find('span.lightbox-close-btn'); // 关闭按钮

        // 准备开发时间，获取组数据
        this.groupName = null;   // 当前组名
        this.groupData = [];   // 当前组数据
        // 事件委托
        this.bodyNode.on('click', '.js-lightbox, *[data-role=lightbox]',function (e) {
            //阻止事件冒泡
            var currentGroupName = $(this).attr('data-group');
            // 当点击的是同一组的数据，则不会在进行数据获取保存
            if (currentGroupName !== self.groupName){
                self.groupName = currentGroupName;
                // 根据当前组名获取同一组数据
                self.getGroup();
            }
            // 初始化弹出
            self.initPopup($(this));
        });
        //关闭功能
        this.popupMask.click(function () {
            $(this).fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });
        this.closeBtn.click(function () {
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });
        this.flag = true;  //防止用户连续快速点击或者误点了两下，打乱了index值
        //hover显示上下按钮
        this.nextBtn.hover(function () {
            if (self.groupData.length > 0 && !($(this).hasClass('disabled'))){
                $(this).addClass('lightbox-next-btn-show');
            }
        }, function () {
            if (self.groupData.length > 0 && !($(this).hasClass('disabled'))){
                $(this).removeClass('lightbox-next-btn-show');
            }
        }).click(function (e) {
            if (!$(this).hasClass('disabled')&&self.flag) {
                e.stopPropagation();
                self.flag = false;
                self.goTo('next');
            }
        });
        this.prevBtn.hover(function () {
            if (self.groupData.length > 0 && !($(this).hasClass('disabled'))){
                $(this).addClass('lightbox-prev-btn-show');
            }
        }, function () {
            if (self.groupData.length > 0 && !($(this).hasClass('disabled'))){
                $(this).removeClass('lightbox-prev-btn-show');
            }
        }).click(function (e) {
            if (!$(this).hasClass('disabled')) {
                e.stopPropagation();
                self.flag = false;
                self.goTo('prev');
            }
        });
        this.isIE6 = /MSIE6.0/gi.test(window.navigator.userAgent);  //正则判断是否是ie6
        //监听视口宽高变化，调整弹出层和图片的大小
        var timer = null;
        this.clear = false;   // 当关闭图片时不再执行监听
        $(window).resize(function () {
            if (self.clear) {
                window.clearTimeout(timer);
                timer = window.setTimeout(function () {
                    self.loadPicSize(self.groupData[self.index].src);
                }, 500);
                if (self.isIE6) {
                    self.popupMask.css({
                        width: $(window).width(),
                        height: $(window).height()
                    })
                }
            }
        }).keyup(function (e) {
            var keyValue = e.which;
            if (self.clear) {
                if (keyValue === 37 || keyValue === 38) {
                    self.prevBtn.click();
                } else if (keyValue === 39 || keyValue === 40){
                    self.nextBtn.click();
                }
            }
        });

        //ie6下滚动处理
        if (self.isIE6) {
            $(window).scroll(function () {
                self.popupMask.css('top', $(window).scrollTop);
            })
        }
    };
    LightBox.prototype = {
        goTo:function (type) {
            var self = this;
            if (type === 'next'){
                this.index++;
                if (this.index >= this.groupData.length-1) {
                  this.nextBtn.addClass('disabled').removeClass('lightbox-next-btn-show');
                }
                // 有可能原本是第一张
                if (this.index !== 0) {
                    this.prevBtn.removeClass('disabled');
                }
            } else {
                this.index--;
                if (this.index <= 0) {
                    this.prevBtn.addClass('disabled').removeClass('lightbox-prev-btn-show');
                }
                if (this.index !== this.groupData.length-1) {
                    this.nextBtn.removeClass('disabled').addClass('lightbox-next-btn-show');
                }
            }
            var src = this.groupData[this.index].src;
            this.loadPicSize(src);
        },
        showMaskAndPopup:function (sourceSrc, currentId) {
            var self = this;

            this.popupPic.hide();
            this.picCaptionArea.hide();
            var winWidth = $(window).width();

            var winHeight = $(window).height();
            this.popupMask.fadeIn();
            var scrollTop = $(window).scrollTop;
            if(this.isIE6) {
                this.popupMask.css({
                    width: winWidth,
                    height: winHeight,
                    top: scrollTop
                })
            }

            this.picViewArea.css({
                width: winWidth/2,
                height: winHeight/2
            });
            this.popupWin.fadeIn();

            var viewHeight = winHeight/2+10;
            var topAnimate = (winHeight-viewHeight)/2;
            this.popupWin.css({
                width: winWidth/2 + 10,
                height: viewHeight,
                marginLeft: -(winWidth/2+10)/2,
                top: (self.isIE6?-(viewHeight+scrollTop):-viewHeight)
            }).animate({
                top: (self.isIE6?topAnimate+scrollTop:topAnimate)
            }, self.settings.speed, function () {
                // 加载图片
                self.loadPicSize(sourceSrc);
            });
            // 根据当前点击的元素id获取在当前组别里面的索引
            this.index = this.getIndexOf(currentId);

            //显示和隐藏上下切换按钮
            var groupDataLength = this.groupData.length;
            if (groupDataLength > 1) {
                if (this.index === 0) {
                    this.prevBtn.addClass('disabled');
                    this.nextBtn.removeClass('disabled');
                } else if(this.index === groupDataLength-1) {
                    this.prevBtn.removeClass('disabled');
                    this.nextBtn.addClass('disabled');
                } else {
                    this.prevBtn.removeClass('disabled');
                    this.nextBtn.removeClass('disabled');
                }
            } else {
                this.prevBtn.addClass('disabled');
                this.nextBtn.addClass('disabled');
            }
        },
        // 加载处理图片大小
        loadPicSize:function (sourceSrc) {
            var self = this;
            this.popupPic.css({width: 'auto', height: 'auto'}).hide();
            this.picCaptionArea.hide();
            this.preLoadImg(sourceSrc, function () {
                self.popupPic.attr('src', sourceSrc);
                var picWidth = self.popupPic.width();
                var picHeight = self.popupPic.height();
                self.changePic(picHeight, picWidth);
            })
        },
        // 改变显示层和图片大小，显示图片描述文本
        changePic:function (height, width) {
            var self = this;
            var winWidth = $(window).width();
            var winHeight = $(window).height();

            //如果图片的宽高大于浏览器视口宽高比例，我就看下是否溢出
            var scale = Math.min(winWidth/(width+10), winHeight/(height+10), 1);
            width = width*scale*self.settings.scale;
            height = height*scale*self.settings.scale;

            this.picViewArea.animate({
                width: width-10,
                height: height-10
            }, self.settings.speed);
            var top = (winHeight-height)/2;
            if (self.isIE6) {
                top += $(window).scrollTop;
            }
            this.popupWin.animate({
                width: width,
                height: height,
                marginLeft: -(width/2),
                top: top
            }, self.settings.speed, function () {
                self.popupPic.css({
                    width: width-10,
                    height: height-10
                }).fadeIn();
                self.picCaptionArea.fadeIn();
                self.flag = true;
                self.clear = true;
            });
            // 设置图片描述文字
            this.captionText.text(this.groupData[this.index].caption);
            this.currentIndex.text('当前索引：' + (this.index+1) + ' of ' + this.groupData.length);
        },
        // 加载图片
        preLoadImg:function (src, callback) {
            var img = new Image();
            if (!!window.ActiveXObject) {  // ie兼容
                img.onreadystatechange = function () {
                    if (this.readyState === 'complete') {
                        callback();
                    }
                }
            } else {
                img.onload = function () {
                    callback();
                }
            }
            img.src = src;
        },
        //获取当前图片在组中索引值
        getIndexOf:function (currentId) {
            var index = 0;
            $(this.groupData).each(function () {
               if (this.id === currentId) {
                   return false;
               }
                index++;
            });
            return index;
        },
        // 初始化弹出层
        initPopup:function (currentObj) {
            var self = this;
            var sourceSrc = currentObj.attr('data-source');
            var currentId = currentObj.attr('data-id');

            this.showMaskAndPopup(sourceSrc, currentId);
        },
        //获取点击图片所在组的数据集
        getGroup:function () {
            var self = this;
            // 根据当前的组别名称获取页面中所有相同组别的对象
            var groupList = this.bodyNode.find('*[data-group='+this.groupName+']');
            // 清空数组
            self.groupData.length = 0;
            groupList.each(function () {
                self.groupData.push({
                    src: $(this).attr('data-source'),
                    id: $(this).attr('data-id'),
                    caption: $(this).attr('data-caption')
                })
            });
        },
        // 渲染蒙版和弹出层节点
        renderDOM:function () {
            var strDom = '<div class="lightbox-pic-view">'+
                            '<span class="lightbox-btn lightbox-prev-btn"></span>'+
                            '<img class="lightbox-image" src="images/2-2.jpg" />'+
                            '<span class="lightbox-btn lightbox-next-btn"></span>'+
                        '</div>'+
                        '<div class="lightbox-pic-caption">'+
                            '<div class="lightbox-caption-area">'+
                                '<p class="lightbox-pic-desc">title</p>'+
                                '<span class="lightbox-of-index">current index: 1 of 3</span>'+
                            '</div>'+
                            '<span class="lightbox-close-btn"></span>'+
                        '</div>';
            //将内容插入到this.popupWin中
            this.popupWin.html(strDom);
            //将遮罩和弹出层插入到body中
            this.bodyNode.append(this.popupMask, this.popupWin);
        }
    };
    window['LightBox'] = LightBox;

})(jQuery);