$(function() {
	var channels = {
		"Lewis & Simon" : "main",
		"Sjin" : "sjin",
		"Duncan" : "duncan",
		"Sips" : "sips",
		"Hannah" : "hannah",
		"Martyn" : "martyn",
		"Rythian" : "rythian",
		"Nilesy" : "nilesy",
		"Hat Films" : "hatFilms",
		"Kim" : "kim",
		"BebopVox" : "bepop",
		"Strippin" : "strippin",
		"Zoey" : "zoey",
		"Panda" : "panda",
		"DaveChaos" : "dave",
		"Parv" : "parv",
		"Zylus" : "zylus",
		"Ridgedog" : "ridge"
	};
	
	function loadSettings() {
		chrome.storage.local.get("settings", function(r) {
			if (r.settings) {
				$.each(r.settings, function(key, value) {
					if (typeof channels[key] != "undefined") {
						var id = channels[key];
						$("input#" + id).prop("checked", value);
					} else {
						$("input#" + key).val(value);
					}
				});
			}
		});
	}
	
	function saveSettings(overideSettings) {
		var settings = {};
		
		overideSettings = overideSettings || false;
		
		if (overideSettings) {
			settings = overideSettings;
		} else {
			$("input").each(function() {
				var $this = $(this), id = $this.attr("id");
				var channelKey = $this.parent("td").prev("td").find("label").text();
				
				if ($this.attr("type") == "checkbox") {
					settings[channelKey] = $(this).is(":checked") ? true : false;
				} else if ($this.attr("type") == "number") {
					settings[id] = parseInt($(this).val());
				}
			});
		}
		
		chrome.storage.local.set({
			settings : settings
		});
		
		if (!overideSettings) {
			$("div.notifybar").text("Options saved").stop().slideDown(200).delay(1000).slideUp(200);
		}
	}
	
	function resetSettings() {
		var settings = {};
		$("input").each(function() {
			var $this = $(this), id = $this.attr("id");
			var channelKey = $this.parent("td").prev("td").find("label").text();
			
			if ($this.attr("type") == "checkbox") {
				settings[channelKey] = false;
			} else if ($this.attr("type") == "number") {
				settings[id] = 10;
			}
		});
		
		saveSettings(settings);
		loadSettings();
		
		$("div.notifybar").text("Options reset").stop().slideDown(200).delay(1000).slideUp(200);
	}
	
	$("#save").click(function() {
		return saveSettings();
	});
	$("#reset").click(function() {
		return resetSettings();
	});
	
	loadSettings();
	
	$.each(channels, function(key, value) {
		var row = "<tr>";
		row += "<td><label for='"+ value +"'>"+ key + "</label></td>";
		row += "<td><input id='"+ value +"' type='checkbox' /></td>";
		row += "</tr>";
		$("table tbody tr:last-child").after(row);
	});
	
	$('.menu a').click(function(ev) {
		ev.preventDefault();
		var selected = 'selected';

		$('.mainview > *').removeClass(selected);
		$('.menu li').removeClass(selected);
		setTimeout(function() {
			$('.mainview > *:not(.selected)').css('display', 'none');
		}, 100);

		$(ev.currentTarget).parent().addClass(selected);
		var currentView = $($(ev.currentTarget).attr('href'));
		currentView.css('display', 'block');
		setTimeout(function() {
			currentView.addClass(selected);
		}, 0);

		setTimeout(function() {
			$('body')[0].scrollTop = 0;
		}, 200);
	});

	$('#launch_modal').click(function(ev) {
		ev.preventDefault();
		var modal = $('.overlay').clone();
		$(modal).removeAttr('style');
		$(modal).find('button, .close-button').click(function() {
			$(modal).addClass('transparent');
			setTimeout(function() {
				$(modal).remove();
			}, 1000);
		});

		$(modal).click(function() {
			$(modal).find('.page').addClass('pulse');
			$(modal).find('.page').on('webkitAnimationEnd', function() {
				$(this).removeClass('pulse');
			});
		});
		$(modal).find('.page').click(function(ev) {
			ev.stopPropagation();
		});
		$('body').append(modal);
	});

	$('.mainview > *:not(.selected)').css('display', 'none');
});