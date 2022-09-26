<template>
	<view>
		<uni-list class="comment-list">
			<uni-list-item v-for="comment in comments" v-bind:key="comment.id" :border="false">
				<template v-slot:body>
					<view class="comment row-clickable">
						<view class="head">
							<view class="head-left">
								<view class="user">{{ comment.uploader }}</view>
								<view class="time"><uni-dateformat format="yyyy-MM-dd hh:mm:ss" :date="comment.time.getTime()"></uni-dateformat></view>
							</view>
							<view class="head-right" v-if="comment.id != '0'">分数：{{ comment.score }}</view>
						</view>
						<text class="content" v-text="comment.content" style="white-space:pre-wrap;" :selectable="true"></text>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
		<uni-load-more :status="loadStatus" @clickLoadMore="loadAllComments"></uni-load-more>
	</view>
</template>

<script>
import api from '@/common/api.js';
export default {
	data() {
		return {
			comments: [],
			galleryId: null,
			loadStatus: 'more'
		};
	},
	methods: {
		async loadAllComments() {
			if (this.loadStatus == 'noMore') return;
			this.loadStatus = 'loading';
			let data = await api.getGalleryDetail(this.galleryId, true);
			this.comments = data.comments;
			this.loadStatus = 'noMore';
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
			that.loadAllComments();
		});
	}
};
</script>

<style lang="scss" scoped>
.comment-list {
	padding-top: 20rpx;
}

.comment {
	padding: 30rpx;
	background: $uni-bg-color-grey;
	border-radius: 20rpx;

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

::v-deep .uni-list-item__container {
	padding: 10rpx 24rpx;
}

.row-clickable {
	// background: $uni-bg-color;
	transition: all 0.1s;
}
.row-clickable:active {
	background: $uni-bg-color-hover;
}
</style>
