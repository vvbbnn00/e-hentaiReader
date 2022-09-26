<template>
	<view>
		<view class="gallery">
			<view class="image-box" v-for="(pic, index) in previews" v-bind:key="pic.href">
				<view class="image-box-cover" @click="readGallery(index)"></view>
				<image mode="widthFix" :src="pic.picUrl" class="image" v-if="pic.type == 'gdtl'"></image>
				<div
					v-if="pic.type == 'gdtm'"
					class="image"
					:style="{
						width: pic.width,
						height: pic.height,
						background: `transparent url(${pic.picUrl}) ${pic.left} ${pic.top} no-repeat`
					}"
				></div>
			</view>
		</view>
		<uni-load-more :status="loadStatus" @clickLoadMore="loadMore"></uni-load-more>
	</view>
</template>

<script>
import api from '@/common/api.js';
import utils from '@/common/utils.js';

export default {
	data() {
		return {
			previews: [],
			previewPage: -1,
			galleryId: null,
			loadStatus: 'more',
			totalPages: 0
		};
	},
	methods: {
		readGallery(index) {
			console.log('[readGallery] ', index);
			let that = this;
			uni.navigateTo({
				url: '/pages/read/read',
				success: function(res) {
					// 通过eventChannel向被打开页面传送数据
					res.eventChannel.emit('pageInit', {
						current: index,
						galleryId: that.galleryId
					});
				}
			});
		},
		async loadMore() {
			if (!this.galleryId) return;
			if (this.loadStatus != 'more') return;
			this.loadStatus = 'loading';
			this.previewPage++;
			let ret = await api.getGalleryDetail(this.galleryId, null, this.previewPage);
			console.log(ret);
			this.totalPages = ret.totalPages - 1;
			this.loadStatus = 'more';
			if (!ret.previews || ret.previews.length == 0) {
				this.previewPage--;
				return;
			}
			if (this.previewPage >= this.totalPages) this.loadStatus = 'noMore';
			let p = ret.previews;
			for (let i = 0; i < p.length; i++) {
				p[i].picUrl = await utils.getPictureCached(p[i].picUrl, `preview_${btoa(p[i].picUrl)}`);
			}
			this.previews = this.previews.concat(ret.previews);
		}
	},
	onLoad() {
		const eventChannel = this.getOpenerEventChannel();
		let that = this;
		// 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
		eventChannel.on('pageInit', function(data) {
			console.log(data);
			if (!data) return;
			Object.assign(that.$data, data);
			that.previewPage = 0;
		});
	},
	onReachBottom() {
		this.loadMore();
	}
};
</script>

<style lang="scss" scoped>
.gallery {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-items: center;
	padding-top: 20rpx;
	.image-box {
		position: relative;
		flex: 0 0 30%;
		padding: 1.5%;
		display: flex;
		justify-items: center;
		align-items: center;
		align-content: center;
		justify-content: center;

		.image-box-cover {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			cursor: pointer;
			transition: all 0.1s;
			z-index: 1;
		}

		.image-box-cover:active {
			background: rgba($uni-bg-color-hover, 0.5);
		}

		.image {
			width: 100%;
		}
	}
}
</style>
