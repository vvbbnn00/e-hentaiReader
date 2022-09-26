<template>
	<view class="app">
		<uni-nav-bar title="EhentaiReader" :fixed="true">
			<block slot="left">
				<view @click="$refs.nav.open()"><uni-icons type="bars" color="#666" size="22" /></view>
			</block>
			<block slot="right">
				<view><uni-icons type="search" color="#666" size="22" /></view>
			</block>
		</uni-nav-bar>

		<LeftsideNavigation selected="主页" ref="nav"></LeftsideNavigation>
		<uni-list>
			<uni-list-item v-for="item in galleryList" v-bind:key="item.id">
				<template v-slot:body>
					<GalleryItem
						:id="item.id"
						:cover="item.cover"
						:title="item.title"
						:pages="item.pages"
						:rate="item.rating"
						:tags="item.tags"
						:updateDate="item.time"
						:uploader="item.uploader"
						:type="item.cate"
						v-on:cardlongpress="openItemActionSheet"
						v-on:click="gotoContent"
						class="gallery-item"
					></GalleryItem>
				</template>
			</uni-list-item>
			<!-- <GalleryItem id="1" ></GalleryItem> -->
		</uni-list>
		<zero-back-top :scrollTop="0" iconType="arrow"></zero-back-top>
	</view>
</template>

<script>
import LeftsideNavigation from '@/components/LeftsideNavigation.vue';
import GalleryItem from '../../components/GalleryItem.vue';
import api from '@/common/api.js';

export default {
	components: {
		LeftsideNavigation,
		GalleryItem
	},
	data() {
		return {
			page: 0,
			galleryList: []
		};
	},
	onShow() {
		// #ifdef APP-PLUS
		plus.navigator.setFullscreen(false);
		// #endif
	},
	async onLoad() {
		this.galleryList = await api.getHomePage();
	},
	methods: {
		openItemActionSheet() {
			// #ifdef APP-PLUS
			let that = this;
			plus.nativeUI.actionSheet(
				{
					title: '更多操作',
					cancel: '取消',
					buttons: [
						{
							title: '查看'
						},
						{
							title: '加入收藏'
						},
						{
							title: '搜索类似'
						},
						{
							title: '封面搜索'
						}
					]
				},
				function(e) {
					// that.selectTagAction(e.index);
				}
			);
			// #endif
		},
		gotoContent(id) {
			uni.navigateTo({
				url: "/pages/detail/detail"
			});
		}
	},
	async onReachBottom() {
		this.page++;
		this.galleryList = this.galleryList.concat(await api.getHomePage(this.page));
	},
	async onPullDownRefresh() {
		this.page = 0;
		this.galleryList = await api.getHomePage();
		uni.stopPullDownRefresh();
	}
};
</script>

<style lang="scss" scoped>
.gallery-item {
	width: 100%;
}

</style>
