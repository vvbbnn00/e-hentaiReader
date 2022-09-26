const TAG_NAMESPACE = {
	language: {
		color: "warning",
		tagCN: "语言",
		tagEN: "language"
	},
	parody: {
		color: "success",
		tagCN: "原作",
		tagEN: "parody"
	},
	character: {
		color: "success",
		tagCN: "角色",
		tagEN: "character"
	},
	group: {
		color: "success",
		tagCN: "团队",
		tagEN: "group"
	},
	artist: {
		color: "success",
		tagCN: "艺术家",
		tagEN: "artist"
	},
	cosplayer: {
		color: "success",
		tagCN: "角色扮演者",
		tagEN: "cosplayer"
	},
	male: {
		color: "primary",
		tagCN: "男性",
		tagEN: "male"
	},
	female: {
		color: "error",
		tagCN: "女性",
		tagEN: "female"
	},
	mixed: {
		color: "info",
		tagCN: "混合",
		tagEN: "mixed"
	},
	other: {
		color: "info",
		tagCN: "其他",
		tagEN: "other"
	}
}

let TAG_DATABASE = uni.getStorageSync("tagDatabase");

import json from "@/common/tag_database.js";

if (!TAG_DATABASE) {
	console.log("Tag数据未缓存，加载代码自带数据");
	TAG_DATABASE = json;
	uni.setStorage({
		key: "tagDatabase",
		data: json,
		fail(err) {
			console.log("TAG数据缓存失败", err)
		},
		success() {
			console.log("TAG数据缓存成功")
		}
	});
} else {
	console.log("Tag数据已缓存，当前版本信息：", TAG_DATABASE.head);
}

let SearchFromTagDatabase = (namespace, tag) => {
	try {
		let n = TAG_DATABASE.data;
		let root;
		n.forEach(item => {
			if (item.namespace === namespace) {
				root = item;
			}
		});
		root = root.data;
		let data = root[tag];
		return {
			tag,
			tagCN: data.name,
			intro: data.intro,
			links: data.links
		}
	} catch (err) {
		console.warn(err);
		return {
			tag,
			tagCN: tag,
			intro: "",
			links: ""
		}
	}

}

export {
	TAG_NAMESPACE,
	TAG_DATABASE,
	SearchFromTagDatabase
}
