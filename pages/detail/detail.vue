<template>
	<view>
		<!-- 本子简要信息区 -->
		<view class="top-block">
			<view class="cover"><image :src="coverActual" class="cover-img" mode="widthFix"></image></view>
			<view class="info">
				<view class="title">{{ computedTitle }}</view>
				<view class="author">{{ uploader }}</view>
				<view class="type">
					<uni-tag :text="computedType.tag" :style="{ background: computedType.color, borderColor: computedType.color, marginRight: '5px' }"></uni-tag>
				</view>
				<view class="action-row">
					<button class="mini-btn" type="primary" size="mini" @click="readGallery()">阅读</button>
					<span>
						<uni-icons class="btn-download" v-if="downloadStatus == 'notDownloaded'" type="cloud-download" @click="download"></uni-icons>
						<view class="downloading">
							<uni-icons
								style="font-size:22px !important"
								class="btn-download"
								v-if="downloadStatus == 'downloading'"
								type="icon-loading"
								customPrefix="iconfont"
							></uni-icons>
						</view>
						<uni-icons class="btn-download" v-if="downloadStatus == 'succeed'" type="trash-filled" @click="deleteRecord"></uni-icons>
					</span>
				</view>
			</view>
		</view>
		<!-- 基本信息区 -->
		<view class="basic-info">
			<view class="flex-row">
				<view class="flex-item">{{ computedLanguage }}</view>
				<view class="flex-item">{{ pages }}页</view>
				<view class="flex-item">{{ size }}</view>
			</view>
			<view class="flex-row">
				<view class="flex-item">
					<span style="margin-right: 10rpx;">
						<uni-icons type="heart-filled" size="14" color="red"></uni-icons>
						{{ likes }}
					</span>
					<span>
						<uni-icons type="star-filled" size="14" color="#ffca3e"></uni-icons>
						{{ rate }} / {{ ratingCount }}
					</span>
				</view>
				<view class="flex-item">
					<uni-icons type="calendar-filled" size="14"></uni-icons>
					{{ time }}
				</view>
			</view>
			<!-- 更多操作 -->
			<scroll-view :scroll-x="true">
				<view class="more-action">
					<view class="button">
						<view class="button-icon"><uni-icons :type="favStatus ? 'heart-filled' : 'heart'" size="35"></uni-icons></view>
						<view class="button-text">{{ !favStatus ? '未收藏' : favLabel }}</view>
					</view>
					<view class="button" @click="share">
						<view class="button-icon"><uni-icons type="redo-filled" size="35"></uni-icons></view>
						<view class="button-text">分享</view>
					</view>
					<view class="button">
						<view class="button-icon"><uni-icons type="color-filled" size="35"></uni-icons></view>
						<view class="button-text">相似画廊</view>
					</view>
					<view class="button">
						<view class="button-icon"><uni-icons type="images-filled" size="35"></uni-icons></view>
						<view class="button-text">封面搜索</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 所属TAG -->
		<view class="detailed-info">
			<view class="title">
				标签
				<span>Tags</span>
			</view>
			<view class="tags">
				<view @click="tagActionSheet(item)" class="tag" v-bind:key="item.id" v-for="item in computedTags">
					<uni-tag :type="item.color" :text="`${item.namespace}:${item.tag}`" />
				</view>
			</view>
		</view>
		<!-- 评分及评论 -->
		<view class="detailed-info">
			<view class="title">
				评分及评论
				<span>Rate & Comments</span>
			</view>
			<view class="rating row-clickable">
				<view class="rating-left">
					<view class="score">{{ rate }}</view>
					<view class="info">满分5分</view>
				</view>
				<view class="rating-right">
					<uni-rate allow-half :value="rate" :readonly="true" />
					<view class="info">{{ ratingCount }}个评分</view>
				</view>
			</view>
			<view class="comments">
				<view class="comment-btn" @click="loadComments">查看全部</view>
				<swiper class="comment-swiper-box" :indicator-dots="false" :autoplay="false">
					<swiper-item v-for="comment in comments" v-bind:key="comment.id">
						<view class="comment" @click="loadComments">
							<view class="head">
								<view class="head-left">
									<view class="user">{{ comment.uploader }}</view>
									<view class="time"><uni-dateformat format="yyyy-MM-dd hh:mm:ss" :date="comment.time.getTime()"></uni-dateformat></view>
								</view>
								<view class="head-right" v-if="comment.id != '0'">分数：{{ comment.score }}</view>
							</view>
							<view class="content" v-text="comment.content" style="white-space:pre-wrap;"></view>
						</view>
					</swiper-item>
				</swiper>
			</view>
		</view>
		<!-- 画廊预览 -->
		<view class="detailed-info">
			<view class="title">
				画廊预览
				<span>Gallery Preview</span>
			</view>
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
			<view class="center-tip row-clickable" @click="loadPreviews">查看更多预览</view>
		</view>
		<!-- 其他信息 -->
		<view class="detailed-info">
			<view class="title">
				其他信息
				<span>Other</span>
			</view>
			<view class="other">
				<uni-list>
					<uni-list-item :clickable="true" @click="copy(gid)" ellipsis="1" title="Gid" :rightText="gid" />
					<uni-list-item :clickable="true" @click="copy(token)" ellipsis="1" title="Token" :rightText="token" />
					<uni-list-item :clickable="true" @click="copy(link)" ellipsis="1" title="链接" :note="link" />
					<uni-list-item :clickable="true" @click="copy(title)" ellipsis="1" title="标题" :note="title" />
					<uni-list-item :clickable="true" @click="copy(titleJP)" ellipsis="1" title="日文标题" :note="titleJP" />
					<uni-list-item :clickable="true" @click="copy(cover)" ellipsis="1" title="缩略图" :note="cover" />
					<uni-list-item :clickable="true" @click="copy(computedType.tag)" ellipsis="1" title="分类" :rightText="computedType.tag" />
					<uni-list-item :clickable="true" @click="copy(uploader)" ellipsis="1" title="上传者" :rightText="uploader" />
					<uni-list-item :clickable="true" @click="copy(time)" ellipsis="1" title="上传时间" :rightText="time" />
					<uni-list-item :clickable="true" @click="copy(computedLanguage)" ellipsis="1" title="语言" :rightText="computedLanguage" />
					<uni-list-item :clickable="true" @click="copy(pages)" ellipsis="1" title="页数" :rightText="pages" />
					<uni-list-item :clickable="true" @click="copy(size)" ellipsis="1" title="大小" :rightText="size" />
					<uni-list-item :clickable="true" @click="copy(likes)" ellipsis="1" title="收藏次数" :rightText="likes" />
					<uni-list-item :clickable="true" @click="copy(rate.toString())" ellipsis="1" title="评分" :rightText="rate.toString()" />
					<uni-list-item :clickable="true" @click="copy(ratingCount)" ellipsis="1" title="评分个数" :rightText="ratingCount" />
				</uni-list>
			</view>
		</view>
	</view>
</template>

<script>
import CATEGROIES from '@/common/categroies.js';
import { TAG_NAMESPACE, SearchFromTagDatabase } from '@/common/tags.js';
import store from '@/common/global_store.js';
import api from '@/common/api.js';
import utils from '@/common/utils.js';

export default {
	data() {
		return {
			link: '',
			title: 'Title',
			titleJP: '标题',
			uploader: 'vvbbnn00',
			type: 'Doujinshi',
			tags: [],
			language: 'chinese',
			downloadStatus: 'notDownloaded', // notDownloaded, downloading, succeed
			downloadProgress: 100,
			rate: 0,
			ratingCount: '0',
			favLabel: '',
			favStatus: false,
			time: '1919-08-10 11:45:14',
			gid: '',
			token: '',
			likes: '0',
			size: '0 B',
			pages: '0',
			comments: [],
			previews: [],
			cover: '',
			coverActual: '',
			galleryId: '2065300/3fef003703/',
			totalPages: 0
		};
	},
	computed: {
		computedTitle() {
			let translate = this.$store.getConfig('config:view:showJapaneseTitle', true);
			return translate ? this.titleJP : this.title;
		},
		computedLanguage() {
			let translate = this.$store.getConfig('config:view:translateTag', true);
			let r = SearchFromTagDatabase('language', this.language.toLowerCase());
			return translate ? r.tagCN : r.tag;
		},
		computedType() {
			let translate = this.$store.getConfig('config:view:translateCate', true);
			if (translate) {
				return {
					color: CATEGROIES[this.type].color,
					tag: CATEGROIES[this.type].tagCN
				};
			} else {
				return {
					color: CATEGROIES[this.type].color,
					tag: CATEGROIES[this.type].tagEN
				};
			}
		},
		computedTagCount() {
			return this.tags.length;
		},
		computedTags() {
			return this.tags.slice(0, 7).map(item => {
				let n = item.split(':');
				let translate = this.$store.getConfig('config:view:translateTag', true);
				if (n.length !== 2)
					return {
						id: item,
						namespace: translate ? TAG_NAMESPACE.other.tagCN : TAG_NAMESPACE.other.tagEN,
						namespaceCN: TAG_NAMESPACE.other.tagCN,
						namespaceEN: TAG_NAMESPACE.other.tagEN,
						color: TAG_NAMESPACE.other.color,
						tag: item,
						tagCN: item,
						tagEN: item
					};
				if (!TAG_NAMESPACE[n[0]]) {
					return {
						id: item,
						namespace: translate ? TAG_NAMESPACE.other.tagCN : TAG_NAMESPACE.other.tagEN,
						namespaceCN: TAG_NAMESPACE.other.tagCN,
						namespaceEN: TAG_NAMESPACE.other.tagEN,
						color: TAG_NAMESPACE.other.color,
						tag: item,
						tagCN: item,
						tagEN: item
					};
				}
				let tag = SearchFromTagDatabase(n[0], n[1]);
				return {
					id: item,
					namespace: translate ? TAG_NAMESPACE[n[0]].tagCN : TAG_NAMESPACE[n[0]].tagEN,
					color: TAG_NAMESPACE[n[0]].color,
					tag: translate ? tag.tagCN : tag.tag,
					namespaceCN: TAG_NAMESPACE[n[0]].tagCN,
					namespaceEN: TAG_NAMESPACE[n[0]].tagEN,
					tagCN: tag.tagCN,
					tagEN: tag.tag
				};
			});
		}
	},
	async onLoad() {
		let data = await api.getGalleryDetail(this.galleryId);
		console.log('[detail.onLoad] data:', data);
		data.coverActual = await utils.getPictureCached(data.cover, `cover_${btoa(this.galleryId)}`);
		console.log('[detail.onLoad] cover:', data.coverActual);
		for (let i = 0; i < data.previews.length; i++) {
			Object.assign(data.previews[i], {
				picUrl: await utils.getPictureCached(data.previews[i].picUrl, `preview_${btoa(data.previews[i].picUrl)}`)
			});
		}
		Object.assign(this.$data, data);
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
		share() {
			let translate = this.$store.getConfig('config:view:showJapaneseTitle', true);
			let shareObj = {
				type: 'text',
				summary: translate ? this.titleJP : this.title,
				href: this.link
			};
			console.log('[share]', shareObj);
			uni.shareWithSystem(shareObj);
		},
		loadPreviews() {
			let that = this;
			uni.navigateTo({
				animationType: 'slide-in-bottom',
				url: '/pages/detail/galleryPreview',
				success: function(res) {
					// 通过eventChannel向被打开页面传送数据
					res.eventChannel.emit('pageInit', {
						previews: that.previews,
						totalPages: that.totalPages,
						galleryId: that.galleryId
					});
				}
			});
		},
		loadComments() {
			let that = this;
			uni.navigateTo({
				animationType: 'slide-in-bottom',
				url: '/pages/detail/commentView',
				success: function(res) {
					// 通过eventChannel向被打开页面传送数据
					res.eventChannel.emit('pageInit', {
						galleryId: that.galleryId
					});
				}
			});
		},
		download() {
			this.downloadStatus = 'downloading';
			api.createDownloadTask(this.galleryId);
			let that = this;
			this.interval = setInterval(() => {
				let r = api.getDownloadTaskStatus(that.galleryId);
				if (!r) return;
				console.log(JSON.stringify(r));
				if (r.progress >= 100) {
					that.downloadStatus = 'succeed';
					clearInterval(that.interval);
				}
			}, 1000);
		},
		deleteRecord() {
			this.downloadStatus = 'notDownloaded';
		},
		tagActionSheet(tag) {
			this.selectedTag = {
				tagCN: `${tag.namespaceCN}:${tag.tagCN}`,
				tagEN: `${tag.namespaceEN}:${tag.tagENÎ}`
			};
			// #ifdef APP-PLUS
			let that = this;
			plus.nativeUI.actionSheet(
				{
					title: this.selectedTag.tagCN,
					cancel: '取消',
					buttons: [
						{
							title: '复制中文TAG'
						},
						{
							title: '复制英文TAG'
						},
						{
							title: '订阅该TAG'
						},
						{
							title: '屏蔽该TAG'
						},
						{
							title: '搜索包含该TAG的内容'
						}
					]
				},
				function(e) {
					that.selectTagAction(e.index);
				}
			);
			// #endif
		},
		selectTagAction(index) {
			switch (index) {
				case 1:
					this.copy(this.selectedTag.tagCN);
					break;
				case 2:
					this.copy(this.selectedTag.tagEN);
					break;
				case 3:
					break;
				case 4:
					break;
				case 5:
					break;
			}
		},
		copy(text) {
			utils.copy(text);
		}
	}
};
</script>

<style lang="scss" scoped>
body {
	color: $uni-text-color;
}

.top-block {
	padding-top: 10rpx;
	display: flex;

	.cover {
		width: 40%;
		display: inline-block;
		padding: 20rpx;
		.cover-img {
			width: 100%;
			max-height: 500rpx;
			min-height: 350rpx;
			height: unset;
			background-color: $uni-bg-color-grey;
		}
	}

	.info {
		width: 60%;
		display: inline-block;
		padding-top: 20rpx;
		.title {
			font-size: medium;
			font-weight: bold;
			margin-bottom: 10rpx;
		}
		.author {
			font-size: small;
			margin-bottom: 10rpx;
		}
		.type {
			display: block;
		}
		.action-row {
			display: flex;
			margin-top: 30rpx;
			width: 100%;
			justify-items: left;
			justify-content: left;

			.mini-btn {
				border-radius: 100px;
				margin-right: 10rpx;
				margin-left: 10rpx;
			}

			.btn-download {
				color: $uni-color-primary !important;
				font-size: 30px !important;
			}
			.btn-download:active {
				color: lighten($uni-color-primary, 25) !important;
			}
		}
	}
}

.basic-info {
	margin: auto 20rpx;
	border-top: 1px solid $uni-border-color;
	padding: 20rpx 30rpx;
	font-size: small;
	.flex-row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		justify-items: center;
		align-items: center;
		flex-wrap: wrap;
		align-content: center;
		padding-bottom: 10rpx;
	}
}
.center-tip {
	text-align: center;
	color: $uni-text-color-grey;
	font-size: small;
	padding: 20rpx;
}
.row-clickable {
	background: $uni-bg-color;
	transition: all 0.1s;
}
.row-clickable:active {
	background: $uni-bg-color-hover;
}

.more-action {
	display: inline-block;
	width: fit-content;
	padding-top: 10rpx;
	white-space: nowrap;
	overflow: hidden;
	.button {
		display: inline-block;
		margin: 0rpx 10rpx;
		padding: 10rpx 25rpx;
		border-radius: 20rpx;
		text-align: center;
		.button-text {
			font-size: small;
		}
	}
	.button:active {
		background: $uni-bg-color-hover;
	}
}

.detailed-info {
	border-top: 1px solid $uni-border-color;
	padding: 20rpx 10rpx;
	margin: auto 20rpx;
	margin-bottom: 20rpx;
	.title {
		font-size: large;
		font-weight: bold;
		span {
			margin-left: 10rpx;
			font-size: medium;
			color: $uni-text-color-grey;
		}
	}
	.tags {
		padding: 0rpx 20rpx;
		.tag {
			display: inline-block;
			margin-right: 10rpx;
			margin-top: 30rpx;
		}
	}

	.rating {
		padding: 20rpx 20rpx;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		align-content: bottom;
		.rating-left {
			.score {
				font-size: xx-large;
				font-weight: bold;
			}
			.info {
				font-size: small;
				color: $uni-text-color-grey;
			}
			margin-right: 30rpx;
		}
		.rating-right {
			text-align: center;
			.info {
				font-size: small;
				color: $uni-text-color-grey;
				padding-top: 10rpx;
			}
		}
	}

	.comment-btn:active {
		color: lighten($uni-color-primary, 25);
	}
	.comment-btn {
		color: $uni-color-primary;
		font-size: small;
		text-align: right;
		padding-right: 20rpx;
		cursor: pointer;
	}

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
	.other {
		padding-top: 20rpx;
	}
}

.comment-swiper-box {
	height: 500rpx;

	.comment {
		margin-top: 10rpx;
		padding: 30rpx;
		margin-left: 20rpx;
		margin-right: 20rpx;
		background: $uni-bg-color-grey;
		border-radius: 20rpx;
		// height: small * 20;

		.head {
			display: flex;
			justify-content: space-between;
			align-items: center;
			.head-left {
				.user {
					font-size: medium;
					font-weight: bold;
				}
				.time {
					padding-top: 5rpx;
					font-size: small;
					color: $uni-text-color-grey;
				}
			}
			.head-right {
				font-size: medium;
				color: $uni-text-color-grey;
			}
		}

		.content {
			padding-top: 20rpx;
			font-size: small;
			overflow: hidden;
			word-break: break-all;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 7;
			-webkit-box-orient: vertical;
		}
	}
}

.downloading {
	-webkit-transform: rotate(360deg);
	animation: rotation 3s linear infinite !important;
	-moz-animation: rotation 3s linear infinite;
	-webkit-animation: rotation 3s linear infinite;
	-o-animation: rotation 3s linear infinite;
}
@keyframes rotation {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(359deg);
	}
}
@-webkit-keyframes rotation {
	from {
		-webkit-transform: rotate(0deg);
	}

	to {
		-webkit-transform: rotate(360deg);
	}
}
</style>
