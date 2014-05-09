(function() {
	const URL_RECENT_VIDEOS = "http://yogscast.com/#browse";
	const ALARM_NAME = "checkNewYogscastVideos";
	
	chrome.alarms.create(ALARM_NAME, {
		when : Date.now(),
		periodInMinutes : 10
	});
	
	function performCheck(callback) {
		console.log("running: " + new Date());
		
		var db = chrome.storage.local;
		
		db.get(null, function(result) {
			/*
			var newestVidData = null;
			if (result.newestVideo !== "undefined") {
				newestVidData = result.newestVideo;
			}
			*/
			
			$.get(URL_RECENT_VIDEOS, function(r) {
				var firstVid = true, allVids = [];
				
				$(r).find("article#latest li figure").each(function() {
					var fig = $(this), data = {};
					
					data.videoId = fig.data("code");
					data.videoImg = fig.find("div.img img").attr("src");
					data.videoLength = fig.find("div.img span.time").text();
					data.videoName = fig.find("figcaption h2").text();
					data.seriesName = fig.find("figcaption p.series").text();
					data.channelName = fig.find("figcaption span.channel").text();
					
					if (data.channelName == "") {
						data.channelName = data.seriesName;
					}
					
					var skip = false;
					if (result.settings) {
						$.each(result.settings, function(key, value) {
							if (data.channelName == key && value == true) {
								skip = true;
							}
						});
					}
					
					if (skip) return true;
					
					if (result.cachedVids) {
						var isNew = true;
						$.each(result.cachedVids, function(index, element) {
							if (element.videoName == data.videoName && element.channelName == data.channelName) {
								isNew = false;
							}
							
							// don't reset "new" status of existing new ones
							if (element.isNew) {
								isNew = true;
							}
						});
						
						data.isNew = isNew;
					} else {
						data.isNew = true;
					}
					
					if (data.isNew) {
						chrome.browserAction.setBadgeText({
							text : "NEW"
						});
					} else {
						chrome.browserAction.setBadgeText({
							text : ""
						});
					}
	
					/*
					if (firstVid) {
						if (newestVidData != null && data.videoId != newestVidData.videoId) {
							// a new video was posted
							chrome.browserAction.setBadgeText({
								text : "NEW"
							});
						} else {
							// no new videos
							chrome.browserAction.setBadgeText({
								text : ""
							});
						}
						
						firstVid = false;
						db.set({
							"newestVideo" : data
						});
					}
					*/
					
					allVids.push(data);
				});
				
				db.set({
					"cachedVids": allVids,
					"lastChecked": new Date().toLocaleString()
				});
				
				if (callback) {
					callback();
				}
			});
		});
	}

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action == "refresh") {
			performCheck(function() {
				sendResponse({
					response : "done"
				});
			});
			return true;
		}
	});

	chrome.alarms.onAlarm.addListener(function(alarm) {
		if (alarm.name != ALARM_NAME) return false;
		
		performCheck();
	});
})();