"use strict";

var robotApp = {};

robotApp.Ajax = function (method, url, callback, async, data) {
    var request = new XMLHttpRequest();

    request.open(method, url, async);

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {

            var response = JSON.parse(this.response);
            if (callback) { callback(response); }
        } else {
            console.log("Error " + this.status);
        }
    }

    request.onerror = function () {
        console.log("Communication Error" + this.response);
    }
    if (data) {
        request.send(data);
    } else {
        request.send();
    }

};

robotApp.baseUrl = "https://friend2.firebaseio.com/";

robotApp.urlMaker = function (base, array) {
    var url = base;

    if (array) {
        for (var x in array) {
            url += array[x] + "/";
        }
    }

    url += ".json";

    return url;
};

robotApp.Robot = {
    group: [],

    createRobot: function (attribute) {
        this.name = attribute.name;
        this.metal = attribute.metal;
        this.picture = attribute.picture;
    },

    addRobot: function () {
        var url;
        var attribute = {}
        var robot;

        attribute.name = document.getElementById("robotName").value;
        attribute.metal = document.getElementById("robotMetal").value;
        attribute.picture = document.getElementById("robotPicture").value;

        robotApp.NewRobot = new robotApp.Robot.createRobot(attribute);

        url = robotApp.urlMaker(robotApp.baseUrl, ["Robots"])
        
        robot = JSON.stringify(robotApp.NewRobot);

        robotApp.Ajax("POST", url, robotApp.Robot.addCB, true, robot);
        
    },

    addCB: function (response) {
        robotApp.NewRobot.key = response.name;

        robotApp.Robot.group.push(robotApp.NewRobot);

        robotApp.DOM.add2Table(robotApp.NewRobot);

        robotApp.NewRobot = null;

        document.getElementById("robotName").value = " ";
        document.getElementById("robotMetal").value = " ";
        document.getElementById("robotPicture").value = " ";

        robotApp.DOM.goHome();
    },

    retrieveRobots: function(){
        var url = robotApp.urlMaker(robotApp.baseUrl, ["Robots"]);

        robotApp.Ajax("GET", url, robotApp.Robot.retrieveRCB, true, null);
    },

    //puts robots from firebase into our array
    retrieveRCB: function(data){

        for (var x in data) {
            data[x].key = x;
            robotApp.Robot.group.push(data[x]);
        }

        robotApp.DOM.drawTable();
    },

    updateSetup: function (key) {
        var nameInput = document.getElementById("robotName");
        var metalInput = document.getElementById("robotMetal");
        var pictureInput = document.getElementById("robotPicture");
        var updateButton = document.getElementById("updateRobot");
        var robot;

        for (var x in robotApp.Robot.group) {
            if (robotApp.Robot.group[x].key === key) {
                robot = robotApp.Robot.group[x];
            }
        }

        updateButton.setAttribute("onclick", "robotApp.Robot.updateRobot('" + key + "')");

        nameInput.value = robot.name;
        metalInput.value = robot.metal;
        pictureInput.value = robot.picture;

        robotApp.DOM.goNew();

    },

    updateRobot: function (key) {
        var index;
        robotApp.updatedRobot;
        for (var x in robotApp.group)
        {
            if(robotApp.group[x].key == key)
            {
                index = x;
                console.log(x);
            }
        }

        var url = robotApp.urlMaker(robotApp.baseUrl, ["Robots",key])
        var attribute = {};
        attribute.name = document.getElementById("robotName").value;
        attribute.metal = document.getElementById("robotMetal").value;
        attribute.picture = document.getElementById("robotPicture").value;

        robotApp.updatedRobot = new robotApp.Robot.createRobot(attribute);

        var newRobot = JSON.stringify(robotApp.updatedRobot);

        robotApp.Ajax("PUT", url, robotApp.Robot.updateCB, true, newRobot);
    },

    updateCB: function (data) {
        var index;

        for (var x in robotApp.Robot.group)
        {
            if (robotApp.Robot.group[x].key == data.name)
                index = x;
        }

        robotApp.Robot.group.splice(index, 1, robotApp.updatedRobot);

        robotApp.DOM.goHome();

        robotApp.DOM.drawTable();
    },

    deleteRobot: function (key) {
        var url = robotApp.urlMaker(robotApp.baseUrl, ["Robots", key]);

        robotApp.Ajax("DELETE", url, robotApp.Robot.deleteRobotCB, true, null);
    },

    deleteRobotCB: function (data) {
        var index;

        robotApp.updatedRobot;
        for (var x in robotApp.group) {
            if (robotApp.group[x].key == data.name) {
                index = x;
                console.log(x);
            }
        }

        robotApp.Robot.group.splice(index, 1);
        robotApp.DOM.drawTable();

    }

};

robotApp.DOM = {
    //callback for retrieveRCB
    drawTable: function () {
        var theTable = document.getElementById("list");
        var robots = robotApp.Robot.group;
        
        theTable.innerHTML = " ";

        for (var x in robots)
        {
            theTable.innerHTML += "<tr>";
            theTable.innerHTML += "<td>" + robots[x].name + "</td><td>" + robots[x].metal + "</td>" 
                               +  '<td><button type="text" class="btn btn-warning" onclick="robotApp.Robot.updateSetup(\'' + robots[x].key + '\')">Edit</button></td>'
                               +  '<td><button type="text" class="btn btn-danger" onclick="robotApp.Robot.deleteRobot(\'' + robots[x].key +'\')">Delete</button></td>';
            theTable.innerHTML += "<tr>";
        }
        
    },

    goNew: function () {
        var ListRobot = document.getElementById("ListRobots");
        var newRobotPage = document.getElementById("CreateRobot");

        ListRobot.setAttribute("class", "hidden");
        newRobotPage.removeAttribute("class");
    },

    goHome: function () {
        var ListRobot = document.getElementById("ListRobots");
        var newRobotPage = document.getElementById("CreateRobot");

        newRobotPage.setAttribute("class", "hidden");
        ListRobot.removeAttribute("class");
    },

    add2Table: function (newRobot) {
        var theTable = document.getElementById("list");

        theTable.innerHTML += "<tr>";
        theTable.innerHTML += "<td>" + newRobot.name + "</td><td>" + newRobot.metal + "</td>" 
                               + '<td><button type="text" class="btn btn-warning" onclick="robotApp.Robot.updateSetup(\'' + newRobot.key + '\')">Edit</button></td>'
                               + '<td><button type="text" class="btn btn-danger" onclick="robotApp.Robot.deleteRobot(\'' + newRobot.key + '\')">Delete</button></td>';
        theTable.innerHTML += "<tr>";
    }

};

robotApp.OnPageLoad = function () {
    robotApp.Robot.retrieveRobots();
};

robotApp.OnPageLoad();


