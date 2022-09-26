## 1. zero-back-top 使用


**符合`easycom`组件模式,放在components目录下直接使用即可 **

```
<template>
    <view>
        <view>
            <view></view>
            <view></view>
            <view></view>
            <view></view>
        </view>
        <!-- 在页面里直接使用  需传入 scrollTop 默认是 rocket 模式-->
      <zero-back-top :scrollTop='scrollTop'></zero-back-top>
    </view>
</template>


<script>
	export default {
		data() {
			return {
				scrollTop: 0,
			}
		},
		onLoad() {

		},
		// 传入 scrollTop ,下面方法是 `on,Page,Scroll` ,不知道为什么上传就变成 Scroll了
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		methods: {

		}
	}
</script>

<style lang="scss" scoped>

</style>

```

## 参数说明

|参数			|类型	|默认值	|说明																			|
|---			|---	|---	|---																			|
|scrollTop		|Number	|0		|当前页面距离顶部,需要在使用页面传进来							|
|iconType		| String|rocket	|rocket:火箭 , arrow:箭头,当模式为rocket时点击图标返回顶部有向上淡出的动画效果	|
|top			|Number	|300	|距离顶部 xx 触发																|
|duration		|Number	|300	|屏幕滚动动画时间																|
|zIndex			|Number	|99		|z-index																		|
|iconSize		|Number	|80		|图标大小																		|
|right			|Number	|50		|图标固定在屏幕底部右侧距离														|
|bottom			|Number	|100	|图标固定在屏幕底部距离															|
|color			|String	|#007aff|图标颜色																		|
|backgroundColor|String	|#ffffff|图标容器背景色																	|


插件预览:
![code](https://gitee.com/zerojs/public/raw/master/uni/we_code.jpg)