(function() {
	const URL_WATCH = "http://yogscast.com/video";
	
	function updatePage(skipAnimation) {
		chrome.storage.local.get(null, function(r) {
			if ($.isEmptyObject(r)) {
				chrome.extension.sendMessage({
					action: "refresh"
				}, function(response) {
					updatePage();
				});
				
				return true;
			}
			
			var vids = r.cachedVids, lastChecked = r.lastChecked, newRows = "";
	
			$.each(vids, function(index, data) {
				if (data.isNew) {
					newRows += "<tr class='new'>";
				} else {
					newRows += "<tr>";
				}
				newRows += "<td>"+ data.channelName + "</td><td class='video-link' title='"+ data.videoName + "' data-code='"+ data.videoId +"'>"+ data.videoName + "</td><td>"+ data.videoLength + "</td></tr>";
				
				vids[index].isNew = false;
			});
			
			chrome.storage.local.set({
				"cachedVids" : vids
			});
			
			$("div span").text("Last updated " + moment(lastChecked).fromNow()).attr("title", lastChecked);
			
			if (!skipAnimation) {
				$("div span").animate({
					backgroundColor: "#7FDBFF"
				}, 1000, function() {
					$(this).animate({
						backgroundColor: "transparent"
					}, 1000);
				});
			}
			
			$("#results tbody tr").remove();
			$("#results tbody").append(newRows);
		});
	}
	
	$(document).ready(function() {
		updatePage(true);
		
		chrome.browserAction.setBadgeText({
			text : ""
		});
		
		$("#results tbody").on("click", "td.video-link", function(event) {
			chrome.tabs.create({
				active: false,
				url: URL_WATCH + "/" + $(this).data("code")
			});
		});
		
		$("div.headline").click(function() {
			chrome.extension.sendMessage({
				action: "refresh"
			}, function(response) {
				updatePage();
			});
		});
	});
})();