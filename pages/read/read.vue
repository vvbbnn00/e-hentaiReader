<template>
	<view class="read-container">
		<!-- 顶部操作栏 -->
		<view class="top-bar">
			<view class="return-btn" @click.stop="back"><uni-icons type="back" size="20"></uni-icons></view>
			<view class="right-area">
				<view class="status" v-if="settings.showBattery">
					<uni-icons color="#fff" custom-prefix="iconfont" type="icon-dianchi" size="16"></uni-icons>
					{{ currentBattery }}
				</view>
				<view class="status" v-if="settings.showTime">
					<uni-icons style="padding-right: 4rpx;" color="#fff" custom-prefix="iconfont" type="icon-shijian" size="16"></uni-icons>
					{{ currentTime }}
				</view>
			</view>
		</view>
		<!-- 底部操作栏 -->
		<view class="bottom-bar" v-if="settings.showProgress">{{ current + 1 }} / {{ totalPages }}</view>
		<!-- 底部操作栏-激活 -->
		<uni-popup :hasMask="false" ref="popupBottom" background-color="#6c6c6c" type="bottom" mask-background-color="transparent">
			<view class="popup-content">
				<view class="page">{{ current + 1 }}/{{ totalPages }}</view>
				<view class="slider">
					<slider
						min="1"
						:max="totalPages"
						:value="current + 1"
						@change="sliderChange"
						activeColor="#dfdfdf"
						backgroundColor="#303030"
						block-color="#b2b2b2"
						block-size="20"
						@changing="sliderChange"
					/>
				</view>
				<view class="settings" @click="openSettings"><uni-icons type="gear-filled" size="28" color="#fff"></uni-icons></view>
			</view>
		</uni-popup>
		<!-- 弹出设置框 -->
		<uni-popup ref="popupSettings">
			<view class="popup-settings">
				<view class="title">阅读设置</view>
				<view class="settings-form">
					<uni-forms class="settings-form" ref="settingsForm" :modelValue="settings" labelWidth="300" labelAlign="right">
						<uni-forms-item name="showTime" label="显示时间">
							<switch @change="switchChanged('showTime', $event)" :checked="settings.showTime" style="transform:scale(0.7)" />
						</uni-forms-item>
						<uni-forms-item name="showBattery" label="显示电量">
							<switch @change="switchChanged('showBattery', $event)" :checked="settings.showBattery" style="transform:scale(0.7)" />
						</uni-forms-item>
						<uni-forms-item name="showProgress" label="显示阅读进度">
							<switch @change="switchChanged('showProgress', $event)" :checked="settings.showProgress" style="transform:scale(0.7)" />
						</uni-forms-item>
						<uni-forms-item name="keepScreen" label="保持亮屏">
							<switch @change="switchChanged('keepScreen', $event)" :checked="settings.keepScreen" style="transform:scale(0.7)" />
						</uni-forms-item>
						<uni-forms-item name="volumnControl" label="音量键翻页">
							<switch @change="switchChanged('volumnControl', $event)" :checked="settings.volumnControl" style="transform:scale(0.7)" />
						</uni-forms-item>
						<uni-forms-item name="rotating" label="屏幕旋转">
							<uni-data-select @change="updateSettings" :clear="false" v-model="settings.rotating" :localdata="rotating"></uni-data-select>
						</uni-forms-item>
						<uni-forms-item name="displaySequence" label="阅读顺序">
							<uni-data-select @change="updateSettings" :clear="false" v-model="settings.displaySequence" :localdata="readingSequence"></uni-data-select>
						</uni-forms-item>
						<uni-forms-item name="autoPageChange" label="自动翻页">
							<switch @change="switchChanged('autoPageChange', $event)" :checked="settings.autoPageChange" style="transform:scale(0.7)" />
						</uni-forms-item>
						<uni-forms-item name="autoChangeInterval" label="自动翻页间隔(ms)">
							<slider
								:disabled="!settings.autoPageChange"
								:min="1000"
								:max="60000"
								:value="settings.autoChangeInterval"
								activeColor="#dfdfdf"
								backgroundColor="#303030"
								block-color="#b2b2b2"
								block-size="20"
								step="500"
								:show-value="true"
							/>
						</uni-forms-item>
					</uni-forms>
				</view>
			</view>
		</uni-popup>
		<!-- 左右滑动模式 -->
		<swiper :autoplay="settings.autoPageChange" :interval="settings.autoChangeInterval" :current="currentCtrl" class="read-leftright" @click="clickAction" @change="changePage">
			<cover-view></cover-view>
			<swiper-item v-for="picture in previewPictures" class="read-leftright">
				<view class="loading fit-parent" v-if="picture.url.length == 0">
					<view class="page-no">{{ picture.index + 1 }}</view>
					<view class="page-info">加载中</view>
				</view>
				<view class="loading fit-parent" v-if="picture.failed">
					<view class="page-no">{{ picture.index + 1 }}</view>
					<view class="page-info">{{ picture.failed }}</view>
				</view>
				<movable-area class="fit-parent" v-if="picture.url.length > 0" @longpress="moreActions">
					<view class="loading fit-parent" style="z-index: 0;">
						<view class="page-no">{{ picture.index + 1 }}</view>
					</view>
					<movable-view
						:x="picture.x"
						:y="picture.y"
						:scale-value="picture.scale"
						:animation="true"
						class="fit-parent picture-container"
						:scale="true"
						direction="all"
						@click="judgeDoubleClick(picture)"
						@scale="changeScale(picture, $event)"
					>
						<image :src="picture.url" class="preview-picture" mode="aspectFit"></image>
					</movable-view>
				</movable-area>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
const PICS_PER_PAGE = 40;
import utils from '@/common/utils.js';
import api from '@/common/api.js';

export default {
	data() {
		return {
			volumnEventListener: false,
			maskPopup: false,
			totalPages: 1,
			current: 0,
			currentCtrl: 0,
			previewPictures: [],
			lastClick: 0,
			currentBattery: '未知',
			timer: null,
			currentTime: '00:00',
			galleryId: '2065300/3fef003703/',
			timerPageLoader: null,
			reload: true,
			settings: {
				volumnControl: true,
				keepScreen: true,
				displaySequence: 'l2r',
				showTime: true,
				showBattery: true,
				autoPageChange: false,
				autoChangeInterval: 3000,
				rotating: 'auto',
				showProgress: true
			},
			rotating: [
				{
					value: 'auto',
					text: '自动旋转'
				},
				{
					value: 'vertical',
					text: '保持竖屏'
				},
				{
					value: 'horizontal',
					text: '保持横屏'
				}
			],
			readingSequence: [
				{
					value: 'l2r',
					text: '从左至右'
				},
				{
					value: 'r2l',
					text: '从右至左'
				},
				{
					value: 'u2d',
					text: '从上至下'
				}
			]
		};
	},
	async onLoad() {
		const eventChannel = this.getOpenerEventChannel();
		let that = this;

		this.timer = setInterval(() => {
			let date = new Date();
			let hours = date.getHours(); //存储时
			let minutes = date.getMinutes(); //存储分
			that.currentTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
			that.getBatteryInfo();
		}, 1000);

		this.timerPageLoader = setInterval(() => {
			let index = that.current;
			if (index > 0) {
				if (!that.previewPictures[index - 1].url) {
					that.loadPage(index - 1);
				}
			}
			if (!that.previewPictures[index].url) that.loadPage(index);
			if (index < that.totalPages - 1) {
				if (!that.previewPictures[index + 1].url) that.loadPage(index + 1);
			}
		}, 500);

		//debug init
		this.init();

		eventChannel.on('pageInit', async function(data) {
			console.log('[pageInit]', data);
			if (!data) return;
			that.galleryId = data.galleryId;
			if (data.current) {
				that.changePage({ detail: { current: data.current } });
				that.currentCtrl = that.current;
			}

			that.init();
		});

		this.updateSettings();
	},
	onShow() {
		this.hidden = false;
		// #ifdef APP-PLUS
		plus.navigator.setFullscreen(true);
		// #endif
	},
	beforeDestroy() {
		clearInterval(this.timer);
		clearInterval(this.timerPageLoader);
	},
	onBackPress() {
		// #ifdef APP-PLUS
		plus.navigator.setFullscreen(false);
		// #endif
	},
	methods: {
		/**
		 * 开关项被修改时触发该事件
		 *
		 * @param {Object} item
		 * @param {Object} $event
		 */
		switchChanged(item, $event) {
			console.log(item, $event);
			this.settings[item] = $event.detail.value;
			this.updateSettings();
		},
		/**
		 * 更新设置
		 */
		updateSettings() {
			console.log(this.settings);
			let that = this;
			this.$nextTick(() => {
				// 音量控制
				// #ifdef APP-PLUS
				if (that.settings.volumnControl) {
					if (!that.volumnEventListener) {
						plus.key.addEventListener('volumedownbutton', that.nextPage, true);
						plus.key.addEventListener('volumeupbutton', that.previousPage, true);
						plus.key.setVolumeButtonEnabled(false);
						that.volumnEventListener = true;
					}
				} else {
					that.volumnEventListener = false;
					plus.key.setVolumeButtonEnabled(true);
					plus.key.removeEventListener('volumedownbutton', that.nextPage, true);
					plus.key.removeEventListener('volumeupbutton', that.previousPage, true);
				}
				// #endif

				// 保持亮屏
				// #ifdef APP-PLUS
				if (that.settings.keepScreen) {
					plus.device.setWakelock(true);
				} else {
					plus.device.setWakelock(false);
				}
				// #endif

				// 屏幕旋转
				// #ifdef APP-PLUS
				switch (that.settings.rotating) {
					case 'vertical':
						plus.screen.lockOrientation('portrait');
						break;
					case 'horizontal':
						plus.screen.lockOrientation('landscape');
						break;
					default:
						that.settings.rotating = 'auto';
						plus.screen.unlockOrientation();
						break;
				}
				// #endif
			});
		},
		openSettings() {
			this.$refs.popupSettings.open();
		},
		async init() {
			let pageInfo = await api.loadImageData(this.galleryId, 0);
			this.totalPages = Number(pageInfo.pages);
			for (let i = 0; i < this.totalPages; i++) {
				this.previewPictures.push({
					x: 0,
					y: 0,
					scale: 1,
					currentScale: 1,
					url: '',
					failed: '',
					preloadUrl: '',
					index: i
				});
			}

			pageInfo.previews.forEach(item => {
				this.previewPictures[item.index].preloadUrl = item.href;
			});
		},
		moreActions() {
			// #ifdef APP-PLUS
			let that = this;
			plus.nativeUI.actionSheet(
				{
					title: '更多操作',
					cancel: '取消',
					buttons: [
						{
							title: '上一张'
						},
						{
							title: '下一张'
						},
						{
							title: '保存至相册'
						}
					]
				},
				function(e) {
					switch (e.index) {
						case 1:
							that.previousPage();
							break;
						case 2:
							that.nextPage();
							break;
						case 3:
							let dUrl = that.previewPictures[that.current].url;
							if (!dUrl) {
								plus.nativeUI.toast('请等待图片加载完毕再下载');
								return;
							}
							plus.nativeUI.toast('正在下载图片');
							uni.downloadFile({
								url: dUrl,
								success: res => {
									if (res.statusCode === 200) {
										plus.nativeUI.toast('正在保存至相册');
										uni.saveImageToPhotosAlbum({
											filePath: res.tempFilePath,
											success: function() {
												plus.nativeUI.toast('已保存至相册');
											},
											fail() {
												plus.nativeUI.toast('保存至相册失败');
											}
										});
									} else {
										plus.nativeUI.toast('图片下载失败');
									}
								},
								fail() {
									plus.nativeUI.toast('图片下载失败');
								}
							});
							break;
					}
				}
			);
			// #endif
		},
		async loadPage(index) {
			if (this.previewPictures[index].url) return;

			let loadPage = Math.floor(index / PICS_PER_PAGE);
			if (!this.previewPictures[index].preloadUrl) {
				let pageInfo = await api.loadImageData(this.galleryId, loadPage);
				pageInfo.previews.forEach(item => {
					this.previewPictures[item.index].preloadUrl = item.href;
				});
			}
			let picData = await utils.getGalleryPicture(this.galleryId, this.previewPictures[index].preloadUrl, index);

			if (picData.success) {
				this.previewPictures[index].url = picData.url;
			} else {
				this.previewPictures[index].failed = picData.message;
			}
		},

		changePage($event) {
			console.log('Page Changed, ', $event.detail.current + 1);
			this.current = $event.detail.current;
		},
		clickAction($event) {
			let that = this;
			uni.getSystemInfo({
				success: res => {
					let rate = $event.detail.x / res.windowWidth;
					if (rate <= 0.35) {
						console.log('left');
						if (that.current > 0) that.current -= 1;
						that.currentCtrl = that.current;
						return;
					}
					if (rate >= 0.65) {
						console.log('right');
						if (that.current < that.totalPages - 1) that.current += 1;
						that.currentCtrl = that.current;
						return;
					}
					if (that.maskPopup) {
						that.$refs.popupBottom.close();
						that.maskPopup = false;
					} else {
						that.$refs.popupBottom.open();
						that.maskPopup = true;
					}
					console.log('center');
				}
			});
		},
		async getBatteryInfo() {
			let data = await utils.getBatteryInfo();
			this.currentBattery = `${data}%`;
		},
		back() {
			uni.navigateBack();
		},
		nextPage() {
			if (this.current < this.totalPages - 1) this.current += 1;
			this.currentCtrl = this.current;
			console.log('[nextPage] goto Next.');
		},
		previousPage() {
			if (this.current > 0) this.current -= 1;
			this.currentCtrl = this.current;
			console.log('[nextPage] goto Previous.');
		},
		judgeDoubleClick(picture) {
			// 200毫秒内点击两次 算作双击
			if (Date.now() - this.lastClick < 250) {
				if (picture.scale != 1 || picture.currentScale != 1) {
					picture.scale = picture.currentScale;
					this.$nextTick(() => {
						picture.scale = 1;
						picture.currentScale = 1;
						picture.x = 0;
						picture.y = 0;
					});
					console.log('[judgeDoubleClick] recover');
				} else {
					picture.scale = 3;
					picture.currentScale = 3;
					console.log('[judgeDoubleClick] enlarge');
				}
			}
			this.lastClick = Date.now();
		},
		changeScale(picture, $event) {
			Object.assign(picture, {
				currentScale: $event.detail.scale
			});
		},
		sliderChange($event) {
			this.current = $event.detail.value - 1;
			this.currentCtrl = this.current;
		}
	}
};
</script>

<style lang="scss">
.read-container {
	background-color: $uni-bg-color-inverse;
}

.read-leftright {
	width: 100vw;
	height: 100vh;
	.preview-picture {
		width: 100%;
		height: 100%;
	}
	.picture-container {
		display: flex;
		align-items: center;
		justify-content: center;
		align-content: center;
		justify-items: center;
		z-index: 1;
	}
}

.fit-parent {
	width: 100%;
	height: 100%;
}

.bottom-bar {
	position: fixed;
	left: 0;
	width: 100%;
	bottom: 75rpx;
	text-align: center;
	font-size: 16px;
	color: $uni-text-color-inverse;
	z-index: 10;
}

.top-bar {
	width: calc(100% - 100rpx);
	position: fixed;
	padding: 55rpx;
	z-index: 10;
	display: flex;
	justify-content: space-between;

	.right-area {
		color: $uni-text-color-inverse;
		font-size: 16px;
		display: flex;
		align-items: center;
		.status {
			margin-left: 20rpx;
			display: flex;
			align-items: center;
		}
	}

	.return-btn {
		width: 30px;
		height: 30px;
		background-color: $uni-bg-color;
		border-radius: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.1s;
	}

	.return-btn:active {
		background-color: $uni-bg-color-hover;
	}
}

.action-cover {
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	display: flex;
	pointer-events: none;
	z-index: 10;
	.left {
		height: 100%;
		width: 35%;
	}
	.right {
		height: 100%;
		width: 35%;
	}
	.center {
		height: 100%;
		width: 30%;
	}
}

.popup-content {
	padding: 30rpx;
	display: flex;
	align-items: center;
	color: $uni-text-color-inverse;
	justify-content: center;
	justify-items: center;
	font-size: 18px;

	padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(30rpx + env(safe-area-inset-bottom));

	.page {
		text-align: center;
		flex: 10%;
	}
	.slider {
		flex: 80%;
	}
	.settings {
		flex: 10%;
	}
}

.loading {
	display: flex;
	align-items: center;
	justify-content: center;
	justify-items: center;
	align-content: center;
	flex-direction: column;
	z-index: 0;

	.page-no {
		display: block;
		font-size: 100rpx;
		font-weight: bold;
		color: $uni-bg-color-grey;
	}

	.page-info {
		display: block;
		font-size: large;
		color: $uni-bg-color-grey;
	}
}

::v-deep .uni-forms-item__content {
	text-align: right;
}

::v-deep .uni-forms-item {
	margin-bottom: 0 !important;
	padding-bottom: 0 !important;
}

.popup-settings {
	width: 40vw;
	min-width: 300px;
	background-color: lighten($uni-bg-color-inverse, 70);
	padding: 30rpx;
	.settings-form {
		width: 100% !important;
	}
	.title {
		font-size: large;
		font-weight: bold;
		padding-top: 10rpx;
		padding-bottom: 20rpx;
	}
}
</style>
