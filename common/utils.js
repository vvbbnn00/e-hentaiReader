import api from '@/common/api.js';
// #ifdef APP-PLUS
import store from '@/common/global_store.js';

const getMetaData = (relativeFilePath) => {
	return new Promise((resolve, reject) => {
		plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, function(fs) {
			// 可通过fs进行文件操作 
			fs.root.getFile(relativeFilePath, {}, (result) => {
				result.getMetadata((r) => {
					resolve([r, result]);
				}, () => {
					console.log("[getMetaData] Get File Meta Data Failed:" + e
						.message);
					resolve(null);
				})
			}, (e) => {
				resolve(null);
			})
			// 通过fs.root获取DirectoryEntry对象进行操作 
			// fs.root 
		}, function(e) {
			console.log("[getMetaData] Request file system failed: " + e.message);
			resolve(null);
		});
	})
};

const getCacheList = () => {
	return new Promise((resolve, reject) => {
		plus.io.resolveLocalFileSystemURL("_downloads/cached/", function(fs) {
			let directoryReader = fs.createReader(); //获取读取目录对象
			console.log("[getCacheList] Request file system success: " + directoryReader);
			directoryReader.readEntries(
				function(entries) { //历遍子目录即可
					console.log("[getCacheList] file number is", entries.length);
					resolve(entries);
				},
				function(err) {
					console.log("[getCacheList] 访问目录失败");
					resolve(null);
				});
		}, function(e) {
			console.log("[getCacheList] Request file system failed: " + e.message);
			resolve(null);
		});
	})
}

let tmpCacheDownloadList = [];

// #endif

class Utils {
	copy(text) {
		uni.setClipboardData({
			data: text,
			success() {
				// #ifdef APP-PLUS
				uni.hideToast();
				plus.nativeUI.toast('内容已复制');
				// #endif
			}
		});
	}

	/**
	 * 同步获取下载任务
	 */
	getDownloadTasks() {
		// #ifdef APP-PLUS
		return new Promise((resolve, reject) => {
			plus.downloader.enumerate(function(tasks) {
				resolve(tasks);
			});
		});
		// #endif
		return [];
	}

	async startDownloadTaskBackground(url, path) {
		// 重复执行的下载任务将被忽略
		if (tmpCacheDownloadList.indexOf(path) !== -1) return null;
		tmpCacheDownloadList.push(path);
		let dpath = '_downloads/' + path;
		let dtask = plus.downloader.createDownload(url, {
			filename: dpath
		}, function(d, status) {
			// 下载完成
			if (status == 200) {
				console.log("[startDownloadTaskBackground] Download success: " + d.filename);
			} else {
				console.log("[startDownloadTaskBackground] Download failed: " + status);
			}
			var index = tmpCacheDownloadList.indexOf(path);
			if (index > -1) {
				tmpCacheDownloadList.splice(index, 1);
			}
		});
		dtask.start();
		setTimeout(() => {
			if (dtask.filename != dpath) {
				dtask.abort();
			}
		}, 1);
		return dtask;
	}

	async getPictureCached(url, filename) {
		// #ifdef APP-PLUS
		let info = await getMetaData("cached/" + filename);
		if (info) {
			let [meta, file] = info;
			let delta = Date.now() - meta.modificationTime.getTime();
			console.log('[getPictureCached] File Cached, Delta=', delta);
			let maxDelta = store.getConfig("config:download:cacheDelta", 3 * 24 * 3600 * 1000); // 默认缓存三天
			if (delta > maxDelta) {
				console.log('[getPictureCached] Cache Expired.');
				file.remove();
			} else {
				console.log('[getPictureCached] Cache Valid.');
				return file.toLocalURL();
			}
		}
		this.startDownloadTaskBackground(url, "cached/" + filename, true);
		// #endif
		return url;
	}

	async clearCache(timespan) {
		// #ifdef APP-PLUS
		if (!timespan) {
			timespan = store.getConfig("config:download:cacheDelta", 3 * 24 * 3600 * 1000);
		}
		console.log("[clearCache] started.");
		let cacheMeta = await getCacheList();
		for (let i = 0; i < cacheMeta.length; i++) {
			let file = cacheMeta[i];
			let meta = await (new Promise((resolve, reject) => {
				file.getMetadata((r) => {
					resolve(r);
				}, (e) => {
					console.log("[clearCache] get Meta failed", file.name);
					resolve(null);
				});
			}));
			if (!meta) continue;
			if (Date.now() - meta.modificationTime.getTime() > timespan) {
				console.log("[clearCache] file expired", file.name);
				file.remove();
			}
		}
		// #endif
	}

	async getCacheSize() {
		// #ifdef APP-PLUS
		return new Promise((resolve, reject) => {
			plus.io.resolveLocalFileSystemURL("_downloads/cached/", function(fs) {
				let directoryReader = fs.createReader(); //获取读取目录对象
				console.log("[getCacheSize] Request file system success: " + directoryReader);
				directoryReader.readEntries(
					async function(entries) { //历遍子目录即可
							let size = 0;
							console.log("[getCacheSize] file number is", entries.length);
							for (let i = 0; i < entries.length; i++) {
								if (!entries[i].isFile) continue;
								size += await (new Promise((resolve, reject) => {
									entries[i].getMetadata((r) => {
										resolve(r.size);
									}, (r) => {
										resolve(0);
									});
								}));
							}
							resolve(size);
						},
						function(err) {
							console.log("[getCacheSize] 访问目录失败");
							resolve(null);
						});
			}, function(e) {
				console.log("[getCacheSize] Request file system failed: " + e.message);
				resolve(0);
			});
		});
		// #endif
	}

	/**
	 * 设置截屏选项
	 * @param {Object} enable true为允许截屏，false则禁止
	 */
	setScreenshotOptions(enable) {
		let WindowManager = plus.android.importClass('android.view.WindowManager');
		plus.android.importClass('android.view.Window');
		let mainActivity = plus.android.runtimeMainActivity();
		let windowAndroid = mainActivity.getWindow();
		let flag = WindowManager.LayoutParams.FLAG_SECURE;
		if (enable) {
			window_android.clearFlags(flag);
		} else {
			windowAndroid.addFlags(flag);
		}
	}

	async getBatteryInfo() {
		// #ifdef APP-PLUS
		switch (plus.os.name.toLowerCase()) {
			case 'ios':
				let UIDevice = plus.ios.import("UIDevice");
				let dev = UIDevice.currentDevice();
				if (!dev.isBatteryMonitoringEnabled()) {
					dev.setBatteryMonitoringEnabled(true);
				}
				let level = dev.batteryLevel();
				if (level < 0) level = 1;
				// 模拟器则自动转换为100电量
				return level * 100;
				break;
			case 'android':
				return new Promise((resolve, reject) => {
					//注意，安卓需要配置下manifest.json文件，打开后，进入模块权限配置，在右侧的Android权限设置里勾选上android.permission.BATTERY_STATS  
					var main = plus.android.runtimeMainActivity();
					var Intent = plus.android.importClass('android.content.Intent');
					var receiver = plus.android.implements(
						'io.dcloud.feature.internal.reflect.BroadcastReceiver', {
							onReceive: function(context, intent) {
								var action = intent.getAction();
								if (action == Intent.ACTION_BATTERY_CHANGED) {
									var level = intent.getIntExtra("level", 0); //电量  
									var voltage = intent.getIntExtra("voltage", 0); //电池电压  
									var temperature = intent.getIntExtra("temperature", 0); //电池温度  
									//如需获取别的，在这里继续写，此代码只提供获取电量  
									console.log(level);
									main.unregisterReceiver(receiver);
									resolve(level);
								}
							}
						});
					var IntentFilter = plus.android.importClass('android.content.IntentFilter');
					var filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
					main.registerReceiver(receiver, filter);
				});
				break;
		}
		// #endif 
		// #ifdef H5
		let d = await navigator.getBattery();
		return d.level * 100;
		// #endif
	}

	async getGalleryPicture(galleryId, url, index) {
		// #ifdef APP-PLUS
		let localUrl = `saved/${btoa(galleryId)}/picture_${index}`;
		let metaData = await getMetaData(localUrl);
		console.log(metaData, localUrl);
		// #endif
		let finalUrl = await api.getGalleryPictureUrl(url);
		if (!finalUrl) return {
			success: false,
			message: "获取图片失败"
		}
		return {
			success: true,
			url: finalUrl
		}
	}
}

export default new Utils();

/*
暂时无法实现的功能

		function screenShot(notification) {
			alert('截屏');
			console.log(notification);
			console.log('ScreenShot');
		}

		let NSNotificationCenter = plus.ios.importClass('NSNotificationCenter');
		let defaultCenter = NSNotificationCenter.defaultCenter();
		let delegate = plus.ios.implements('NSObject', {
			'userDidTakeScreenshotNotification:': screenShot
		});
		defaultCenter.addObserverselectornameobject(delegate, plus.ios.newObject('@selector', 'userDidTakeScreenshotNotification:'), 'UIApplicationUserDidTakeScreenshotNotification', null);


*/
