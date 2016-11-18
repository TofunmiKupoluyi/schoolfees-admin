var app= angular.module("myApp", ['ngRoute','chart.js']);
var editData="";
app.config(function($routeProvider){
$routeProvider

.when("/", {
    templateUrl:"analytics.html",
    controller:"AnalyticsController"
})
.when("/form", {
    templateUrl:"form.html",
    controller:"FormController"
})

.when("/data", {
    templateUrl:"data.html",
    controller:"DataController"
})
.when("/edit", {
    templateUrl:"edit.html",
    controller:"EditController"
})
.when("/settings", {
    templateUrl:"settings.html",
    controller:"SettingsController"
})
.otherwise({
    redirectTo:"/"
});

});


app.controller("HomeController", function($scope){
    $scope.message="Welcome to my single page web-app utilizing the capabilities of Node's REST API";
});


app.service("dataServices", function($http, $window, $q){
    var narrations="";
    
    this.getNarration= function(){
        var deferred= $q.defer();
        $http.get("/data/narration").then(function(response){
            var narrations= response.data.narrations;
            if(narrations){
                deferred.resolve(narrations);
            }
            else{
                deferred.reject("No narrations available");
            }
        });
        return deferred.promise;
    };

    this.getFees= function(){
        var deferred= $q.defer();
        $http.get("/data/fees").then(function(response){
            var fees= response.data.fees;
            if(fees){
                deferred.resolve(fees);
            }
            else{
                deferred.reject("No fees available");
            }
        });
        return deferred.promise;
    };
});

app.controller("FormController", function($scope, $http, dataServices){
   dataServices.getNarration().then(function(response){
       $scope.narrations=response;
   });
    $scope.sendForm= function(){
        var data={
            payerfirstname: "N/A",
            payerlastname: "N/A",
            payeremail: "N/A",
            payerrelationship: "N/A",
            studentfirstname: $scope.studentfirstname,
            studentlastname: $scope.studentlastname,
            studentclass: $scope.studentclass,
            studentarm: $scope.studentarm,
            studentid: $scope.studentid,
            amountpaid: $scope.amountpaid,
            narration: $scope.narration
        }
        $http.post("/data", data).then(
            function(response){
                $scope.message= response.data.products;
                if($scope.message=="Input successful"){
                    window.location="#/data";
                }
            }
        );
    };
    
});


app.controller("DataController", function(dataServices, $scope, $http){
    dataServices.getNarration().then(function(response){
        $scope.narrations= response;
        console.log(response);
    });
    
    $scope.message="There is an error";
    $scope.buttonClickable="disabled";
    $http.get("/data").then(function(response){
        $scope.message= response.data.products;
    });

     $scope.productClicked= function(idreference, id, studentfirstname, studentlastname, studentclass, studentarm, status){
        $scope.idreference= idreference;
        $scope.studentid= id;
        $scope.studentfirstname= studentfirstname;
        $scope.studentlastname=studentlastname;
        $scope.studentclass=studentclass;
        $scope.studentarm= studentarm;
        $scope.status= status;
        $scope.buttonClickable="btn-primary";   
        window.scrollTo(0,0);     
    };

    $scope.editClicked= function(idreference,id, studentfirstname, studentlastname, studentclass, studentarm, status){
        editData={
            idreference: idreference,
            studentid: id,
            studentfirstname: studentfirstname,
            studentlastname: studentlastname, 
            studentclass: studentclass,
            studentarm: studentarm,
            status: status
        };
        window.location="#/edit";
    };

    $scope.filter= function(){
        var filter= $scope.searchclass;
        var searchquery= $scope.searchQuery;
        var issuccessful= $scope.issuccessful;
        var searcharm=$scope.searcharm;
        var narration=$scope.narration;
        $http.get("/data/filterclass?filter="+filter+"&searchquery="+searchquery+"&issuccessful="+issuccessful+"&searcharm="+searcharm+"&narration="+narration).then(function(response){
            $scope.message= response.data.products;
        });
    }
    

});

app.controller("EditController", function($scope, $http){
    $scope.idreference=editData.idreference;
    $scope.id=editData.id;
    $scope.studentfirstname= editData.studentfirstname;
    $scope.studentlastname= editData.studentlastname;
    $scope.studentclass= editData.studentclass;
    $scope.studentid= editData.studentid;
    $scope.studentarm= editData.studentarm;
    $scope.status= editData.status;
    
    $scope.alterClick= function(){
        var newData={
            idreference: $scope.idreference,
            id:$scope.id,
            studentfirstname: $scope.studentfirstname,
            studentlastname: $scope.studentlastname,
            studentclass: $scope.studentclass,
            studentid: $scope.studentid,
            studentarm: $scope.studentarm,
            status: $scope.status,
        }
        $http.post("/data/update", newData).then(function(response){
            $scope.message=response.data.products;
        });
    };

    $scope.deleteClick = function(){
        var deleteData={
            idreference: $scope.idreference,
            id:$scope.id,
            studentfirstname: $scope.studentfirstname,
            studentlastname: $scope.studentlastname,
            studentclass: $scope.studentclass,
            studentid: $scope.studentid,
            studentarm: $scope.studentarm,
            status: $scope.status,
        };
        $http.post("data/delete", deleteData).then(function(response){
            $scope.message= response.data.products;
        });
            $scope.idreference="";
            $scope.id="";
            $scope.studentfirstname="";
            $scope.studentlastname="";
            $scope.studentclass="";
            $scope.studentid="";
            $scope.studentarm="";
            $scope.status="";
    };
    $scope.backClick=function(){
        window.location="#/data";
    };
});

app.service("updateFeeService", function($http, $q){
    this.sendFees= function(data){
        var deferred= $q.defer();
        $http.post("/data/updateFees", data).then(function(response){
            if(response){
                deferred.resolve(response.data.newArray);
            }
            else{
                deferred.reject("Error");
            }
        });
        return deferred.promise;
    };

    this.addFees= function(data){
        var deferred= $q.defer();
        $http.post("/data/addFees", data).then(function(response){
            if(response){
                console.log(response.data);
                deferred.resolve(response.data.newArray);
            }
            else{
                deferred.reject("Error");
            }
        });
        return deferred.promise;
    }

});

app.controller("SettingsController", function($scope, $http, dataServices, updateFeeService){
    $scope.newRows=[];
    dataServices.getFees().then(function(response){
        $scope.fees=response;
        
    });
    $scope.visible=false;
    $scope.onClick=function(){
        $scope.visible=true;
        $scope.updateName="Update";
    };

    $scope.update= function(){
        var fees= $scope.fees;
        $scope.activeButton="disabled";
        var data={
            fees:fees
        };
        updateFeeService.sendFees(data).then(function(response){
            $scope.fees= response;
            $scope.activeButton="";
            $scope.visible=false;
        });
    };

    
    $scope.addNewRowClick= function(){
        var blankData= {
            fees:"",
            narration:""
        }
        $scope.newRows.push(blankData);
    };

    $scope.onNewClick = function(){
        $scope.newVisible=true;
        $scope.newName="Add Fee";
    };

    $scope.addRow= function(){
        var fees= $scope.newRows;
        $scope.activeButton="disabled";
        var data={
            fees:fees
        };
        updateFeeService.addFees(data).then(function(response){
            console.log(response);
            $scope.newRows=[];
            $scope.fees= response;
            $scope.newVisible=false;
            $scope.activeButton="";
        });
    }
});

app.service("analyticsService", function($http, $q){
    function getTransactions(filter){
        var deferred= $q.defer();
        if(filter){
            $http.get("/data/transactions?filter="+filter).then(function(response){
                if(response){
                    deferred.resolve(response);
                }
                else{
                    deferred.reject("No response");
                } 
            });
            return deferred.promise;
        }
        else{
            $http.get("/data/transactions").then(function(response){
                if(response){
                    deferred.resolve(response);
                }
                else{
                    deferred.reject("No response");
                }
            });
            return deferred.promise;
        }
    };

    this.getTransactions= function(filter){
        var deferred= $q.defer();
        getTransactions(filter).then(function(response){
            if(response){
                deferred.resolve(response);
            }
            else{
                deferred.reject("Error, no response");
            }
        });
        return deferred.promise;   
    };

    this.orderTransactions= function(filter){
        var deferred= $q.defer();
        getTransactions(filter).then(function(response){
            var total=[0,0,0,0,0,0];
            if(response){
                for(var i=0; i<response.data.response.length;i++){
                    switch(response.data.response[i].studentclass){
                        case 1: 
                            total[0]+=response.data.response[i].amountpaid;
                        break;
                        case 2: 
                            total[1]+=response.data.response[i].amountpaid;
                        break;
                        case 3: 
                            total[2]+=response.data.response[i].amountpaid;
                        break;
                        case 4: 
                            total[3]+=response.data.response[i].amountpaid;
                        break;
                        case 5: 
                            total[4]+=response.data.response[i].amountpaid;
                        break;
                        case 6: 
                            total[5]+=response.data.response[i].amountpaid;
                        break;   
                    } 
                }
                deferred.resolve(total);   
            }
            else{
                deferred.reject("Error in arrangement");
            } 
        });
        return deferred.promise;
    };


    
});

app.controller("AnalyticsController", function($scope, dataServices, analyticsService){
    dataServices.getNarration().then(function(response){
        $scope.narrations= response;
    });
    analyticsService.getTransactions().then(function(response){
        console.log(response);
        $scope.successfulCount= response.data.successfulCount;
        $scope.unsuccessfulCount= response.data.unsuccessfulCount;
        $scope.successfulAmount= accounting.formatMoney(response.data.successfulAmount, "₦ ", 2, " ", ".");
    });
    analyticsService.orderTransactions().then(function(total){
        $scope.data=[total];
    });

    $scope.options={
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true   
                }
            }]
        }
    }
    $scope.chartType="bar";
    $scope.labels =["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

    $scope.getNarrationClick= function(narration){
        analyticsService.getTransactions(narration).then(function(response){
            console.log(response);
            $scope.successfulCount= response.data.successfulCount;
            $scope.unsuccessfulCount= response.data.unsuccessfulCount;
            $scope.successfulAmount= accounting.formatMoney(response.data.successfulAmount, "₦ ", 2, " ", ".");
        });
        analyticsService.orderTransactions(narration).then(function(total){
            $scope.data=[total];
        });
    };

    
});