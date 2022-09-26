<template>
	<view v-if="show">
		<view class="zero-back-top"
			:class="[fadeOut?iconType=='rocket'?'fade-out-rocket':'fade-out':'',iconType=='rocket'?'rocket':'']" :style="{
		  width: `${iconSize}rpx`,
		  height: `${iconSize}rpx`,
		  right: `${right}rpx`,
		  bottom: `${bottom}rpx`,
		  <!-- #ifdef H5 -->
		   bottom: `${bottom+60}rpx`,
		  <!-- #endif -->
		  backgroundColor:backgroundColor,
		  zIndex: zIndex
		}" @click="backToTop">
			<text v-if="iconType=='rocket'" class="icon" :style="{
				color:color,
				fontSize:`${iconSize}rpx`,
				lineHeight:`${iconSize}rpx`,
				}">
				&#xe7d9;
			</text>
			<text v-else class="icon" :style="{
				color:color,
				fontSize:`${iconSize}rpx`,
				lineHeight:`${iconSize}rpx`,
				}">
				&#xe8f3;
			</text>

		</view>
	</view>
</template>

<script>
	export default {
		name: "zero-back-top",
		props: {
			// 需要在使用页面 onPageScroll 传进来
			scrollTop: {
				type: Number,
				default: 0
			},
			// rocket // arrow
			iconType: {
				type: String,
				default: 'rocket',
			},
			// 距离顶部 xx 触发
			top: {
				type: Number,
				default: 300
			},
			// 屏幕滚动时间
			duration: {
				type: Number,
				default: 300
			},
			// z-index
			zIndex: {
				type: Number,
				default: 99
			},
			// 图标大小
			iconSize: {
				type: Number,
				default: 80
			},
			//以下两个暂时废弃,都用iconSize
			// width: {
			// 	type: Number,
			// 	default: 60
			// },
			// height: {
			// 	type: Number,
			// 	default: 60
			// },
			// 距离右边的距离
			right: {
				type: Number,
				default: 50
			},
			// 距离底部的距离
			bottom: {
				type: Number,
				default: 100
			},
			// 图标颜色
			color: {
				type: String,
				default: '#007aff',
			},
			// 图标背景色
			backgroundColor: {
				type: String,
				default: '',
			},
		},
		data() {
			return {
				fadeOut: false,
			};
		},
		computed: {
			show() {
				let top
				// 如果是rpx，转为px
				if (/rpx$/.test(this.top)) {
					top = uni.rpx2px(parseInt(this.top))
				} else {
					// 如果px，通过parseInt获取其数值部分
					top = parseInt(this.top)
				}
				return this.scrollTop > top
			},
		},
		methods: {
			backToTop() {
				this.fadeOut = true
				uni.pageScrollTo({
					scrollTop: 0,
					duration: this.duration
				});
				let timer = null
				timer = setTimeout(() => {
					this.fadeOut = false
					timer = null
				}, this.duration);

				this.$emit('setScrollTop')
			}
		}
	}
</script>

<style lang="scss">
	.zero-back-top {
		position: fixed;
		// bottom: 100rpx;
		// /* #ifdef H5 */
		// bottom: 180rpx;
		// /* #endif */
		// right: 20rpx;
		// width: 60rpx;
		// height: 60rpx;
		overflow: hidden;
		border-radius: 50%;
		animation: fadeIn 0.3s linear both;
		-moz-box-shadow: 0 0 10rpx #999999;
		-webkit-box-shadow: 0 0 10rpx #999999;
		box-shadow: 0 0 10rpx #999999;

	}

	.rocket {
		box-shadow: none;
		text-shadow: 4rpx 4rpx #cccccc;
	}

	.fade-out {
		animation: fadeOut 0.3s linear both;
	}

	.fade-out-rocket {
		animation: fadeOutUp 0.3s linear both;
	}

	@font-face {
		font-family: iconfont;
		src: url('../../static/zero-back-top/iconfont.ttf');
	}

	.icon {
		font-family: iconfont;
	}

	@keyframes fadeIn {
		0% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	@keyframes fadeOutUp {
		0% {
			opacity: 1;
		}

		100% {
			opacity: 0;
			-webkit-transform: translate3d(0, -700rpx, 0);
			transform: translate3d(0, -700rpx, 0) scale(0.6);
		}
	}

	@keyframes fadeOut {
		0% {
			opacity: 1;
		}

		100% {
			opacity: 0;
			transform: scale(0.5);
		}
	}
</style>
