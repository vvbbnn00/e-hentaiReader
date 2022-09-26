class GlobalStore {
	// 维护一个全局唯一的下载队列
	downloadingList = [];

	init() {
		try {
			this.downloadingList = JSON.parse(uni.getStorageSync("system:download:downloading"));
		} catch (e) {
			console.log("[store.init] load download list failed(downloading).");
			this.downloadingList = [];
		}
	}

	getConfig(key, defaultValue) {
		let result = uni.getStorageSync(key);
		if (!result) {
			if (defaultValue) {
				this.setConfig(key, defaultValue);
			}
			return defaultValue;
		}
		return result;
	}

	setConfig(key, value) {
		uni.setStorage({
			key,
			data: value
		});
	}

	setConfigSync(key, value) {
		uni.setStorageSync(key, value);
	}
}

export default new GlobalStore();
