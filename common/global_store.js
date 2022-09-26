class GlobalStore {
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