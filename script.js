// This code started out okay and then slowly deteriorated as it went on.

function getProjects(username, offset, callback) {
	$.ajax({
		url: "https://crossorigin.me/https://api.scratch.mit.edu/users/" + username + "/projects?offset=" + 20 * offset,
		crossDomain: true,
		context: document.body
	})
	.done(callback)
	.fail(function(){
		console.log("error bros");
		$("#errorMessage").addClass("showing");
		$("#loader_img").removeClass("showing");
		window.setTimeout(function(){
			$("#errorMessage").removeClass("showing")
		}, 10000);
	});
}


function getAllProjects(user, callback, offset, projects) {
	var projects = projects || [];
	offset = offset || 0;
	getProjects(user, offset, function(data) {
		projects = projects.concat(data);
		if(data.length === 20) {
			getAllProjects(user, callback, offset + 1, projects);
		} else {
			var totals = getTotalsCount(projects);
			callback(projects, totals);
		}
	});
}

// I'm not joking about it getting progressively worse.

function generateRow(projectObj) {
	var html = "<tr>";
	var dateDisplay = projectObj.history.created.substring(8, 10) + " " + ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"][projectObj.history.created.substring(5, 7) - 1] + " " + projectObj.history.created.substring(0, 4);
	html += "<td data-sort-value='" + Date.parse(projectObj.history.created)/1000 + "'>" + dateDisplay + "</td>";
	html += "<td><a title='" + projectObj.title.replace(/\'/g, "&#39;") + "' href='https://scratch.mit.edu/projects/" + projectObj.id + "/'>";
	html += "<img src='https://cdn2.scratch.mit.edu/get_image/project/" + projectObj.id + "_30x30.png' width='30px'>";
	html += projectObj.title + "</a></td>";
	html += "<td>" + projectObj.stats.loves + "</td>";
	html += "<td>" + projectObj.stats.favorites + "</td>";
	html += "<td>" + projectObj.stats.views + "</td>";
	html += "<td>" + projectObj.stats.comments + "</td>";
	html += "</tr>";
	return html;
}

function generateTBody(projectsArray) {
	var html = "";
	for(i = 0; i < projectsArray.length; i++) {
		html += generateRow(projectsArray[i]);
	}
	return html;
}

// GET OUT WHILE YOU STILL CAN

function getTotalsCount(projectsArray) {
	var totals = {
		loves: 0,
		favorites: 0,
		views: 0,
		comments: 0,
		projects: projectsArray.length
	};
	projectsArray.forEach(function(elem, index){
		totals.loves += elem.stats.loves;
		totals.favorites += elem.stats.favorites;
		totals.views += elem.stats.views;
		totals.comments += elem.stats.comments;
	});
	return totals;
}

function generateTotalsHTML(totals) {
	var html = "<td></td>";
	html += "<td>Total</td>";
	html += "<td>" + totals.loves + "</td>";
	html += "<td>" + totals.favorites + "</td>";
	html += "<td>" + totals.views + "</td>";
	html += "<td>" + totals.comments + "</td>";
	return html;
}

function generateUserHTML(userData) {
	var html = "<b>" + userData.username + "</b><br>";
	if(userData.history.joined)
		html += "Joined: " + new Date(userData.history.joined).toDateString() + "<br>";
	if(userData.history.login)
		html += "Last login: " + new Date(userData.history.login).toString() + "<br>";
	return html;
}

function getAllData(username, callback) {
	getAllProjects(username, function(projects, totals){
		callback(projects, totals);
	});
}

function resizeHeadFoot(){
	$("#projectsTable thead th, #projectsTableFooter td").css("width", Math.round(window.innerWidth / 6) + "px");
};
resizeHeadFoot();
$(window).resize(resizeHeadFoot);


function searchUser(username) {
	$("#loader_img").addClass("showing");
	getAllData(username, function(projects, totals) {
		$("#projectsTableBody").html(generateTBody(projects));
		$("#projectsTableFooter").html(generateTotalsHTML(totals));
		$("#projectsTable thead").css("display", "block");
		$("#errorMessage").removeClass("showing");
		var table = $("#projectsTable");
		table.stupidtable().find("thead th").eq(0).stupidsort();
		resizeHeadFoot();
		$("#loader_img").removeClass("showing");
	});
}

$("#user-input-wrapper .button").click(function(){
	searchUser($("#user-input-wrapper .styled-text").val());
	$(".input-group").removeClass("centered");
	$(this).blur();
});
$("#user-input-wrapper .styled-text").keyup(function (e) {
    if (e.keyCode == 13) {
        searchUser($(this).val());
        $(".input-group").removeClass("centered");
    }
});

$(".styled-text").focus();
