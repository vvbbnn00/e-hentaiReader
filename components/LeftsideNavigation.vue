<template>
	<view>
		<uni-drawer shadow ref="drawer" mode="left" :fixed="true">
			<!-- 左侧弹窗 -->
			<view class="left-window">
				<view class="top-avatar">
					<image class="avatar-img" src="@/static/avatar.png" width="65px" height="65px" />
					<view class="avatar-username">{{ username }}</view>
				</view>
				<view class="left-list">
					<uni-list>
						<uni-list-item
							:show-extra-icon="true"
							showArrow
							:extra-icon="{ type: 'home-filled', size: 22 }"
							title="主页"
							:class="selected == '主页' ? 'selected' : ''"
						></uni-list-item>
						<uni-list-item
							:show-extra-icon="true"
							showArrow
							:extra-icon="{ type: 'notification-filled', size: 22 }"
							title="订阅"
							:class="selected == '订阅' ? 'selected' : ''"
						></uni-list-item>
						<uni-list-item
							:show-extra-icon="true"
							showArrow
							:extra-icon="{ type: 'fire-filled', size: 22 }"
							title="热门"
							:class="selected == '热门' ? 'selected' : ''"
						></uni-list-item>
						<uni-list-item
							:show-extra-icon="true"
							showArrow
							:extra-icon="{ type: 'star-filled', size: 22 }"
							title="收藏夹"
							:class="selected == '收藏夹' ? 'selected' : ''"
						></uni-list-item>
						<uni-list-item
							:show-extra-icon="true"
							showArrow
							:extra-icon="{ type: 'calendar-filled', size: 22 }"
							title="浏览记录"
							:class="selected == '浏览记录' ? 'selected' : ''"
						></uni-list-item>
						<uni-list-item
							:show-extra-icon="true"
							showArrow
							:extra-icon="{ type: 'cloud-download-filled', size: 22 }"
							title="下载"
							:class="selected == '下载' ? 'selected' : ''"
						></uni-list-item>
						<uni-list-item
							:show-extra-icon="true"
							showArrow
							:extra-icon="{ type: 'gear-filled', size: 22 }"
							title="设置"
							:class="selected == '设置' ? 'selected' : ''"
						></uni-list-item>
					</uni-list>
				</view>
			</view>
		</uni-drawer>
	</view>
</template>

<script>
export default {
	name: 'LeftsideNavigation',
	props: {
		selected: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			username: '未登录'
		};
	},
	mounted() {
		this.username = uni.getStorageSync('userinfo_username');
		if (!this.username) this.username = '未登录';
	},
	methods: {
		open() {
			this.$refs.drawer.open();
		}
	}
};
</script>

<style lang="scss">
.left-window {
	background-color: $uni-bg-color;
}

.top-avatar {
	background-image: url('@/static/background.jpeg');
	height: 260rpx;
	background-position: center;
	background-size: cover;
	display: flex;
	justify-content: center;
	justify-items: center;
	align-items: center;
	align-content: center;
	flex-direction: column;
	margin-top: var(--status-bar-height);
	.avatar-username {
		padding-top: 20rpx;
		font-size: small;
		font-weight: bold;
		color: $uni-text-color-inverse;
	}
}

.left-list {
	margin-top: 20rpx;
}

.selected {
	background-color: darken($uni-bg-color-hover, 5);
}

.avatar-img {
	height: 65px;
	width: 65px;
	border-radius: 100px;
}
</style>
