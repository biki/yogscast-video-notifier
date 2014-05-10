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
			
			$.get(URL_RECENT_VIDEOS, function(r) {
				var allVids = [];
				
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
						oneNewVid = true;
					}
					
					allVids.push(data);
				});
				
				var newVids = 0;
				$.each(allVids, function(key, value) {
					if (value.isNew) {
						newVids++;
					}
				});
				
				if (newVids > 0) {
					chrome.browserAction.setBadgeText({
						text : "" + newVids
					});
				} else {
					chrome.browserAction.setBadgeText({
						text : ""
					});
				}
				
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