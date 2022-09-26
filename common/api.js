import utils from '@/common/utils.js';
const store = getApp().$store;
const API_CONFIG = {
	'e-hentai': {
		protocol: 'https',
		host: 'e-hentai.org',
		directUrl: 'https://e-hentai.org/',
		ip: ['104.20.134.21', '172.67.0.127', '104.20.135.21']
	},
	'exhentai': {
		protocol: 'https',
		host: 'exhentai.org',
		directUrl: 'https://exhentai.org/',
		ip: ['178.175.132.22', '178.175.129.252', '178.175.128.252', '178.175.129.254', '178.175.128.254',
			'178.175.132.20'
		]
	}
};
const TAG_DATA_URL = "https://cdn.jsdelivr.net/gh/EhTagTranslation/DatabaseReleases@latest/db.text.json";
const FORUM_URL = "https://forums.e-hentai.org/";
var DOMParser = require('xmldom').DOMParser;

const RATING_MAP = {
	"-80px -1px": 0,
	"-64px -21px": 0.5,
	"-64px -1px": 1,
	"-48px -21px": 1.5,
	"-48px -1px": 2,
	"-32px -21px": 2.5,
	"-32px -1px": 3,
	"-16px -21px": 3.5,
	"-16px -1px": 4,
	"0px -21px": 4.5,
	"0px -1px": 5,
}

const INFO_MAP_LEFT = {
	"Posted": "time",
	"Parent": "parent",
	"Visible": "visible",
	"Language": "language",
	"File Size": "size",
	"Length": "pages",
	"Favorited": "likes"
}

const NOT_FAV_STATUS = "Add to Favorites";

function getInnerText(node, text) {
	if (!text) text = "";
	if (!node.childNodes || node.childNodes.length == 0) return text;
	// console.log(node.childNodes);
	Array.from(node.childNodes).forEach(item => {
		if (item.data) {
			text += item.data
		} else {
			text = getInnerText(item, text);
		}
	});
	return text;
}

function getInnerTextWithBr(node, text) {
	if (!text) text = "";
	if (node.tagName && node.tagName === 'br') return text + '\n';
	if (!node.childNodes || node.childNodes.length == 0) return text;
	Array.from(node.childNodes).forEach(item => {
		if (item.data) {
			text += item.data
		} else {
			text = getInnerTextWithBr(item, text);
		}
	});
	return text;
}



class EhAPI {
	_getBaseConfig() {
		let channel = store.getConfig("config:network:channel", "e-hentai");
		let result = {
			directUrl: '',
			displayUrl: '',
			additionalHeaders: {}
		}
		let config = API_CONFIG[channel];
		if (!config) config = API_CONFIG('e-hentai');
		result.directUrl = config.directUrl;
		result.displayUrl = config.displayUrl;
		// 绕过gfw的DNS阻断
		// #ifdef APP-PLUS
		// let enableInternalDNS = score.getConfig("config:network:internalDNS", true);
		// if (enableInternalDNS) {
		// 	result.directUrl = `${config.protocol}://${config.ip[0]}/`;
		// 	result.additionalHeaders = {
		// 		'Host': config.host
		// 	}
		// }
		// #endif
		return result;
	}

	_request(url, method, data) {
		return new Promise((resolve, reject) => {
			let baseConfig = this._getBaseConfig();
			uni.request({
				url: baseConfig.directUrl + url,
				method: method,
				data: data,
				header: {
					// todo
					...baseConfig.additionalHeaders
				},
				success: (res) => {
					console.debug(`[HTTP REQUEST] ${url} - ${method} success.`);
					resolve(res);
				},
				fail: (res) => {
					console.warn(`[HTTP REQUEST] ${url} - ${method} failed.`)
					reject(res);
				},
				sslVerify: false
			});
		});
	}

	async getHomePage(page) {
		(page === undefined) && (page = 0);

		let ret = await this._request(`?f_cats=767&page=${page}`, "GET");
		let htmlDoc = new DOMParser().parseFromString(ret.data, 'text/html');
		// console.log(htmlDoc);
		let tableElement = htmlDoc.getElementsByClassName("itg gltc")[0];
		// console.log(tableElement)
		let results = tableElement.getElementsByTagName("tr");
		let resultList = Array.from(results).filter(item => {
			let r = item.getElementsByTagName("td");
			return r.length > 1;
		}).map(item => {
			// console.log(item)
			let cate = getInnerText(item.getElementsByClassName("gl1c")[0]);
			let rating = item.getElementsByClassName("gl2c")[0].getElementsByClassName("ir")[0];
			let rating_pos = rating.getAttribute("style").split(";")[0].split(":")[1];
			rating = RATING_MAP[rating_pos];
			rating = rating ? rating : 0;
			let t = getInnerText(item.getElementsByClassName("gl2c")[0])
			let time = t.split('pages');
			time = time[time.length - 1];
			let title = getInnerText(item.getElementsByClassName("gl3c")[0].getElementsByClassName("glink")[
				0]);
			let tags = Array.from(item.getElementsByClassName("gl3c")[0].getElementsByClassName("gt")).map(
				item => item
				.getAttribute("title"));
			let uploader = getInnerText(item.getElementsByClassName("gl4c")[0].getElementsByTagName('a')[
				0]);
			let pages = Number(getInnerText(item.getElementsByClassName("gl4c")[0].getElementsByTagName(
				'div')[1]).split(" ")[0]);
			let id = item.getElementsByClassName("gl3c")[0].getElementsByTagName("a")[0].getAttribute(
				"href").split("/g/")[
				1];
			let e = item.getElementsByClassName("gl2c")[0].getElementsByTagName("img")[0];
			let cover = e.getAttribute("data-src") ? e.getAttribute("data-src") : e.getAttribute("src");
			return {
				cate,
				time,
				title,
				tags,
				uploader,
				pages,
				id,
				rating,
				rating_pos,
				cover
			}
		});
		// console.log(resultList);
		return resultList;
	}

	/**
	 * 获取画廊详细信息
	 * @param id 画廊ID
	 * @param showAllComments 显示所有评论
	 */
	async getGalleryDetail(id, showAllComments, previewPage) {
		try {
			const BASE_URL = this._getBaseConfig().directUrl;
			(previewPage === undefined) && (previewPage = 0);
			let ret = await this._request(`g/${id}?p=${previewPage}${showAllComments ? "&hc=1" : ""}`);
			if (ret.statusCode === 404) {
				return {
					success: false,
					message: '该画廊不存在或只能通过Exhentai浏览'
				}
			}
			let htmlDoc = new DOMParser().parseFromString(ret.data, 'text/html');
			let gid = id.split("/")[0],
				token = id.split("/")[1];
			let galleryData = {
				gid,
				token
			};
			galleryData.link = `${BASE_URL}g/${gid}/${token}`;
			let title = getInnerText(htmlDoc.getElementById("gn"));
			let titleJP = getInnerText(htmlDoc.getElementById("gj"));
			titleJP = titleJP ? titleJP : title;
			galleryData.title = title;
			galleryData.titleJP = titleJP;
			galleryData.type = getInnerText(htmlDoc.getElementById("gdc")).trim();
			galleryData.uploader = getInnerText(htmlDoc.getElementById("gdn")).trim();
			// gallery cover
			let coverNode = htmlDoc.getElementById("gd1").getElementsByTagName("div")[0];
			if (coverNode) {
				let style = coverNode.getAttribute("style");
				let u = /background\:transparent\s+url\((.+?)\)/.exec(style);
				if (u.length >= 2) galleryData.cover = u[1];
			}

			// detail left
			let detailList = htmlDoc.getElementById("gdd").getElementsByTagName("tr");
			Array.from(detailList).forEach(item => {
				let kv = getInnerText(item).trim().split(":");
				if (kv && kv.length < 2) return;
				let lk = INFO_MAP_LEFT[kv[0]];
				if (lk) {
					if (lk == 'time')
						galleryData[lk] = kv[1] + ':' + kv[2];
					else
						galleryData[lk] = kv[1];
				}
			});
			if (galleryData.likes) galleryData.likes = galleryData.likes.split(" ")[0];
			if (galleryData.pages) galleryData.pages = galleryData.pages.split(" ")[0];

			galleryData.ratingCount = getInnerText(htmlDoc.getElementById("grt3")).trim();
			galleryData.rate = Number(getInnerText(htmlDoc.getElementById("rating_label")).trim().split(":")[1]
				.trim());
			galleryData.rate = isNaN(galleryData.rate) ? 0 : galleryData.rate;

			galleryData.favLabel = getInnerText(htmlDoc.getElementById("favoritelink")).trim();
			galleryData.favStatus = galleryData.favLabel != NOT_FAV_STATUS;

			// tags
			let tagCateList = htmlDoc.getElementById("taglist").getElementsByTagName("tr");
			let tagList = [];
			Array.from(tagCateList).forEach(item => {
				let l = item.getElementsByTagName("td");
				let namespace = getInnerText(l[0]).trim();
				(l[1] ? Array.from(l[1].getElementsByTagName("div")) : []).forEach(item => {
					tagList.push(`${namespace}${getInnerText(item).trim()}`);
				});
			});
			galleryData.tags = tagList;

			// previews
			let previewList = htmlDoc.getElementById("gdt").childNodes;

			// preview pages
			let previewPageList = htmlDoc.getElementsByClassName("ptt")[0];
			let totalPages = 0;
			if (previewPageList) {
				let p = previewPageList.getElementsByTagName("td");
				Array.from(p).forEach(item => {
					let t = Number(getInnerText(item).trim());
					if (!isNaN(t) && t > totalPages) totalPages = t;
				});
			}
			galleryData.totalPages = totalPages;

			let previews = [];
			// console.log(previewList);
			Array.from(previewList).forEach(item => {
				let href = item.getElementsByTagName("a")[0],
					picUrl;
				if (!href) return;
				href = href.getAttribute("href").replace(BASE_URL, "");
				let className = item.getAttribute("class"),
					left, top, width, height;
				switch (className) {
					case 'c':
						return;
						break;
					case 'gdtl':
						picUrl = item.getElementsByTagName("img")[0];
						if (!picUrl) return;
						picUrl = picUrl.getAttribute("src");
						break;
					case 'gdtm':
						picUrl = item.getElementsByTagName("div")[0];
						if (!picUrl) return;
						picUrl = picUrl.getAttribute("style");
						ret =
							/width\:(.+?)\;\s+height\:(.+?)\;\s+background\:transparent\s+url\((.+?)\)\s+(.+?)\s+(.+?)/g
							.exec(picUrl);
						picUrl = ret[3];
						left = ret[4];
						top = ret[5];
						width = ret[1];
						height = ret[2];
						break;
					default:
						break;
				}
				previews.push({
					picUrl,
					href,
					type: className,
					left,
					top,
					width,
					height
				});
			});
			galleryData.previews = previews;

			// comments
			let commentList = htmlDoc.getElementById("cdiv").getElementsByClassName("c1");
			let comments = [];
			Array.from(commentList).forEach(item => {
				// uploader and date
				let upload = item.getElementsByClassName("c3")[0];
				if (!upload) return;
				let p = getInnerText(upload).trim();
				let r = /Posted\s+on\s+(.+?)\s+by\:\s*(.+)/.exec(p);
				if (r && !r.length == 3) return;
				let uploader = r[2].trim();
				let time = new Date(r[1]);
				// score
				let score = '0';
				let s = item.getElementsByClassName("c5")[0];
				if (s) {
					p = getInnerText(s);
					r = /Score\s+(.+)/.exec(p);
					if (r && r.length == 2) {
						score = r[1];
					}
				};
				// comment id 
				p = item.getElementsByClassName("c6")[0];
				if (!p) return;
				let id = p.getAttribute("id").split("_")[1];
				let content = getInnerTextWithBr(p);
				comments.push({
					uploader,
					time,
					score,
					id,
					content
				});
			});
			galleryData.comments = comments;
			return {
				success: true,
				...galleryData
			}
		} catch (err) {
			console.warn(err);
			return {
				success: false,
				message: "获取画廊内容失败：" + err
			}
		}

	}

	/**
	 * 获取图片链接信息列表
	 * @param id 画廊ID
	 * @param previewPage 预览页
	 */
	async loadImageData(id, previewPage) {
		try {
			const BASE_URL = this._getBaseConfig().directUrl;
			(previewPage === undefined) && (previewPage = 0);
			let ret = await this._request(`g/${id}?p=${previewPage}&inline_set=ts_m`);
			if (ret.statusCode === 404) {
				return {
					success: false,
					message: '该画廊不存在或只能通过Exhentai浏览'
				}
			}
			let galleryData = {};
			let htmlDoc = new DOMParser().parseFromString(ret.data, 'text/html');

			// detail left
			let detailList = htmlDoc.getElementById("gdd").getElementsByTagName("tr");
			Array.from(detailList).forEach(item => {
				let kv = getInnerText(item).trim().split(":");
				if (kv && kv.length < 2) return;
				let lk = INFO_MAP_LEFT[kv[0]];
				if (lk) {
					if (lk == 'time')
						galleryData[lk] = kv[1] + ':' + kv[2];
					else
						galleryData[lk] = kv[1];
				}
			});
			if (galleryData.pages) galleryData.pages = galleryData.pages.split(" ")[0];

			// previews
			let previewList = htmlDoc.getElementById("gdt").childNodes;

			let previews = [],
				index = previewPage * 40;
			Array.from(previewList).forEach(item => {
				let href = item.getElementsByTagName("a")[0],
					picUrl;
				if (!href) return;
				href = href.getAttribute("href").replace(BASE_URL, "");
				previews.push({
					href,
					index
				});
				index++;
			});
			galleryData.previews = previews;

			return {
				success: true,
				...galleryData
			}
		} catch (err) {
			console.warn(err);
			return {
				success: false,
				message: "获取画廊内容失败：" + err
			}
		}
	}


	/**
	 * 通过相应地址获取临时图片URL
	 * 
	 * @param {Object} href
	 */
	async getGalleryPictureUrl(href) {
		let ret = await this._request(href, "GET");
		let htmlDoc = new DOMParser().parseFromString(ret.data, 'text/html');
		let img = htmlDoc.getElementById("img");
		if (!img) return null;
		return img.getAttribute("src");
	}

	/**
	 * 创建一个下载任务，首先获取本子的全部基本信息以及每一张图
	 * 所对应的下载URL，接着再创建下载队列，将每个下载任务的ID
	 * 保存，定时调用查询。
	 * 
	 * @param {Object} galleryId
	 */
	async createDownloadTask(galleryId) {
		console.log("[createDownloadTask] get basic data", galleryId);
		for (let i = 0; i < store.downloadingList.length; i++) {
			if (store.downloadingList[i].galleryId == galleryId) {
				utils.startDownloadTasks(i);
				return i;
			}
		}
		let galleryDetail = await this.getGalleryDetail(galleryId);
		if (!galleryDetail.success) return null;
		delete galleryDetail.success;
		let downloadInfo = {
			galleryId,
			...galleryDetail,
			downloadTasks: []
		};
		for (let i = 0; i < downloadInfo.totalPages; i++) {
			let pictureData;
			for (let retry = 0; retry < 3; retry++) {
				console.log("[createDownloadTask] getting image data ", galleryId, i);
				pictureData = await this.loadImageData(galleryId, i);
				if (!pictureData.success) {
					console.log("[createDownloadTask] getting image data failed, retrying...", galleryId, i, retry);
				} else {
					break;
				}
			}
			if (!pictureData.success) {
				console.log("[createDownloadTask] getting image data failed, max retried exceeded.", galleryId, i);
				return null;
			}
			downloadInfo.downloadTasks = downloadInfo.downloadTasks.concat(pictureData.previews);
		}
		console.log("[createDownloadTask]", galleryId, JSON.stringify(downloadInfo));
		let index = store.downloadingList.push(downloadInfo) - 1;
		utils.startDownloadTasks(index);
		return index;
	}

	/**
	 * 通过画廊ID获取下载任务进度，若任务不存在，返回null
	 * 
	 * @param {Object} galleryId
	 */
	getDownloadTaskStatus(galleryId) {
		let task = null;
		for (let i = 0; i < store.downloadingList.length; i++) {
			if (store.downloadingList[i].galleryId == galleryId) {
				task = store.downloadingList[i];
				break;
			}
		}
		if (!task) return null;
		let total = task.downloadTasks.length,
			success = 0,
			failed = 0,
			pending = 0;
		task.downloadTasks.forEach(item => {
			if (!item.status) {
				pending++;
			}
			if (item.status == 'success') {
				success++;
			}
			if (item.status == 'failed') {
				failed++;
			}
			if (item.status == 'pending') {
				pending++;
			}
		});
		return {
			started: task.started,
			total,
			success,
			failed,
			pending,
			progress: success / total * 100
		}
	}
}

export default new EhAPI();
