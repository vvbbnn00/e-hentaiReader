<template>
	<view>
		<view @longpress="cardActionSheet" @click="cardClick">
			<uni-card class="summary-card" margin="0px" padding="3px" :style="{ 'background-image': `url(${actualCover})` }">
				<template v-slot:title>
					<view class="item-title">
						<uni-tag
							:text="computedType.tag"
							circle
							size="small"
							:style="{ background: computedType.color, borderColor: computedType.color, marginRight: '5px' }"
						></uni-tag>
						<span @longpress.stop="copy(title)">{{ title }}</span>
					</view>
				</template>
				<view class="item-body">
					<view class="cover-img"><image class="cover-img-obj" :src="actualCover" :lazy-load="true" mode="widthFix"></image></view>
					<view class="description">
						<view class="description-info">
							<span class="title">上传者：</span>
							<span class="clickable" @longpress.stop="copy(uploader)">{{ uploader }}</span>
						</view>
						<view class="description-info">
							<span class="title">页数：</span>
							{{ pages }}
						</view>
						<view class="description-info"><uni-rate :allowHalf="true" :disabled="true" :value="rate" disabledColor="#ffca3e"></uni-rate></view>
						<view class="description-info">
							<view @longpress.stop="tagActionSheet(item)" class="tag" v-bind:key="item.id" v-for="item in computedTags">
								<uni-tag :type="item.color" :text="`${item.namespace}:${item.tag}`" size="mini" />
							</view>
							<span v-if="computedTagCount > 7">...</span>
						</view>
					</view>
				</view>
				<template v-slot:actions>
					<view class="footer">
						<uni-icons type="calendar" size="20" :customStyle="{ paddingRight: '8rpx' }" />
						{{ updateDate }}
					</view>
				</template>
			</uni-card>
		</view>
		<!-- <pi-action-sheet v-model="actionSheetOpen" :description="selectedTag.tagCN" :items="popupItems" cancelText="取消" @select="selectTagAction"></pi-action-sheet> -->
	</view>
</template>

<script>
import CATEGROIES from '@/common/categroies.js';
import { TAG_NAMESPACE, SearchFromTagDatabase } from '@/common/tags.js';
import store from '@/common/global_store.js';
import utils from '@/common/utils.js';

export default {
	name: 'GalleryItem',
	props: {
		type: {
			type: String,
			default: 'Doujinshi'
		},
		title: {
			type: String,
			default: '标题Title'
		},
		cover: {
			type: String,
			default: ''
		},
		uploader: {
			type: String,
			default: 'Uploader'
		},
		rate: {
			type: Number,
			default: 0
		},
		pages: {
			type: Number,
			default: 0
		},
		updateDate: {
			type: String,
			default: '1971-01-01 08:00:00'
		},
		tags: {
			type: Array,
			default: () => ['language:chinese']
		},
		id: {
			type: String,
			default: ''
		}
	},
	computed: {
		computedType() {
			let translate = store.getConfig('config:view:translateCate', true);
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
				let translate = store.getConfig('config:view:translateTag', true);
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
	data() {
		return {
			actualCover: '',
			copySuccess: false,
			actionSheetOpen: false,
			selectedTag: {
				tagCN: '',
				tagEN: ''
			},
			popupItems: [
				{
					id: 1,
					text: '复制中文TAG'
				},
				{
					id: 2,
					text: '复制英文TAG'
				},
				{
					id: 3,
					text: '订阅该TAG'
				},
				{
					id: 4,
					text: '屏蔽该TAG'
				},
				{
					id: 5,
					text: '搜索包含该TAG的内容'
				}
			]
		};
	},
	methods: {
		cardActionSheet() {
			console.log('长按卡片');
			this.$emit('cardlongpress');
		},
		copy(text) {
			utils.copy(text);
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
		cardClick() {
			this.$emit('click', this.id);
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
		}
	},
	async mounted() {
		this.actualCover = await utils.getPictureCached(this.cover, `cover_${btoa(this.id)}`);
	}
};
</script>

<style lang="scss">
.summary-card {
	z-index: 0;
	background-size: 0;
	background-color: transparent !important;
	overflow: hidden;

	.item-title {
		align-items: center;
		font-size: medium;
		font-weight: bold;
		color: $uni-text-color;
		white-space: normal;
		padding: 20rpx 8rpx;
	}
	.item-body {
		display: flex;
		.clickable {
			color: $uni-color-primary;
			font-weight: bold;
			text-decoration: underline;
			cursor: pointer;
		}

		.tag {
			display: inline-block;
			margin-right: 10rpx;
			margin-top: 5rpx;
		}

		.description {
			width: 65%;
			padding-left: 20rpx;
			line-height: 40rpx;
			.title {
				font-size: small;
				color: $uni-color-subtitle;
				font-weight: bold;
			}
		}

		.cover-img {
			width: 35%;
			// min-height: 150rpx;
			max-height: 600rpx;
			overflow: hidden;
		}
	}
}

.summary-card::after {
	////
	-webkit-transform: translateZ(0);
	-moz-transform: translateZ(0);
	-ms-transform: translateZ(0);
	-o-transform: translateZ(0);
	-webkit-transform: translate3d(0, 0, 0);
	-moz-transform: translate3d(0, 0, 0);
	-ms-transform: translate3d(0, 0, 0);
	transform: translate3d(0, 0, 0);
	////
	background-image: inherit;
	background-position: center;
	background-size: cover;
	background-color: white;
	filter: blur(20px);
	backdrop-filter: blur(20px);
	position: absolute;
	overflow: hidden;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	content: ' ';
	z-index: -2;
}

.summary-card::before {
	background-color: rgba(255, 255, 255, 0.7);
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	content: ' ';
	z-index: -1;
	transition: all 0.1s;
}

.summary-card:active::before {
	background-color: rgba(255, 255, 255, 0.3);
}

.footer {
	padding: 20rpx 10rpx;
	font-size: small;
	display: flex;
	align-items: center;
	justify-items: right;
	justify-content: right;
}

.cover-img-obj {
	width: 100%;
	height: unset;
	min-height: 200rpx;
	background-color: $uni-bg-color-grey;
}
</style>
