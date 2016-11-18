var express= require("express");
var mysql= require("mysql");
var bodyParser= require("body-parser");
var app=express();
var router= express.Router();
app.use("images", express.static("./images"));
app.use("dependencies", express.static("./node_modules"))
app.use(express.static('./'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));
app.get("/", function(req,res){
    res.sendfile("index.html");
});
app.use("/data", router);
var connection= mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DB || "schoolfees"
});
app.listen(process.env.PORT || 3000);



router.post("/", function(request, response){
    var payerfirstname= request.body.payerfirstname;
    var payerlastname= request.body.payerlastname;
    var payeremail= request.body.payeremail;
    var payerrelationship= request.body.payerrelationship;
    var studentfirstname= request.body.studentfirstname;
    var studentlastname= request.body.studentlastname;
    var studentclass= request.body.studentclass;
    var studentarm= request.body.studentarm;
    var studentid= request.body.studentid;
    var amountpaid= request.body.amountpaid;
    var narration= request.body.narration;
    var d = new Date();
    var year = d.getFullYear();
    var day= d.getDate();
    var month= d.getMonth()+1;
    var fullDate= year+"-"+month+"-"+day;
    var items={
        payerfirstname: payerfirstname,
        payerlastname: payerlastname,
        payeremail: payeremail,
        payerrelationship: payerrelationship,
        studentfirstname: studentfirstname,
        studentlastname: studentlastname,
        studentclass: studentclass,
        studentarm: studentarm,
        studentid: studentid,
        amountpaid: amountpaid,
        narration: narration,
        status: "Successful",
        datepaid:fullDate
    };
    var data={
        error:1,
        products:""
    };
    connection.query("INSERT INTO payments SET ?", items, function(err, res){
        if(err){
            data.error=1;
            data.products="Error in code";
            console.log("Error in code "+err);
            response.json(data);
        }
        else{
            data.error=0;
            data.products="Input successful";
            console.log("Data inserted");
            response.json(data);
        }
    });
});

router.get("/", function(request, response){
    var data={
        error:1,
        products:""
    };
    connection.query("SELECT * FROM payments ORDER BY id DESC", function(err, rows, fields){
        if(rows){
            if(rows.length>0){
                data.products=rows;
                for(var i=0; i<rows.length; i++){
                    var d = new Date(rows[i]["datepaid"]);
                    console.log(d);
                    var year = d.getFullYear();
                    var day= d.getDate();
                    var month= d.getMonth()+1;
                    var fullDate= year+"-"+month+"-"+day;
                    rows[i]["datepaid"]=fullDate;
                }
            
                data.error=0;
                response.json(data);
            }
            else{
                data.products="No products found";
                data.error=1;
                response.json(data);
            }
        }
        else{
            data.products="Error";
            data.error=1;
            response.json(data);
        }
    });
    
});

router.post("/update", function(request, response){
    var data={
        error:1,
        products:""
    };
    var idreference= request.body.idreference;
    var studentfirstname= request.body.studentfirstname;
    var studentlastname= request.body.studentlastname;
    var studentclass= request.body.studentclass;
    var studentarm= request.body.studentarm;
    var studentid= request.body.studentid;
    connection.query("UPDATE payments SET studentfirstname=? , studentlastname=?, studentclass=?, studentarm=?, studentid=? WHERE ID=?",[studentfirstname, studentlastname, studentclass, studentarm, studentid, idreference], function(err, res){
        if(err){
            data.error=1;
            data.products="Error in code "+err;
            response.json(data);
        }
        else{

            data.error=0;
            data.products="Data update successful";
            console.log(res);
            response.json(data);
        }
    });
});

router.get("/narration", function(request, response){
    console.log("Welcome to narrations");
    var data={
        error:1,
        narrations:""
    }
    connection.query("SELECT narration FROM fees", function(err, res){
        if(err){
            data.error=1;
            data.narrations="No narrations";
            response.json(data);
        }
        else{
            data.error=0;
            data.narrations=res;
            response.json(data);
        }
    });
});

router.get("/fees", function(request, response){
    console.log("Welcome to fees");
    var data={
        error:1,
        fees:""
    }
    connection.query("SELECT * FROM fees", function(err, res){
        if(err){
            data.error=1;
            data.fees="No fees";
            response.json(data);
        }
        else{
            data.error=0;
            data.fees=res;
            response.json(data);
        }
    });

});

router.post("/updateFees", function(request, response){
    var data={
        error:1,
        newArray: ""
    }
    var receivedData= request.body.fees;
    console.log(receivedData);
    for(var i=0; i<receivedData.length; i++){
        var id= receivedData[i]["id"];
        var narration= receivedData[i]["narration"];
        var fees= receivedData[i]["fees"];
        connection.query("UPDATE fees SET narration=?, fees=? WHERE id=?",[narration, fees, id], function(err, res){
            if(err){
                data.newArray=[];
                data.error=1;
                
            }
            else{
                console.log("Here");
                data.error=0;
            }
        });
    }
    data.error=0;
    data.newArray= receivedData;
    response.json(data);

});

router.post("/addFees", function(request, response){
    
    var receivedData= request.body.fees;
    function addFeesFunction(){
        var data= {
            error:1,
            newArray: ""
        };

        for(var i=0; i<receivedData.length;i++){
            connection.query("INSERT INTO fees SET ?", [receivedData[i]], function(err, res){
                if(err){
                    data.error=1;
                    data.newArray="Error in code "+err;
                    console.log(data);
                    response.json(data);
                    console.log("THEERE IS AN ERROR O");
                    return;
                }
                
            });
            
        }       
        connection.query("SELECT * FROM fees", function(err, res){
            
            if(err){
                data.error=1;
                data.newArray="Error in second step of code";
                console.log(data);
            }
            else{
                data.error=0;
                data.newArray=res;
                console.log(data);
                response.json(data);
            }
        });
    }
    addFeesFunction();
});

        

router.get("/filterclass", function(request, response){
    console.log("We're here");
    var data={
        error:1,
        products: ""
    }
    if(request.query.filter!="undefined"){
        var classQuery= request.query.filter+"%";
    }
    else{
        var classQuery="%";
    }
    if(request.query.searchquery!="undefined"){
        var searchQuery= request.query.searchquery+"%";
    }
    else{
        var searchQuery= "%";
    }
    if(request.query.searcharm!="undefined"){
        var searcharm= request.query.searcharm+"%";
    }
    else{
        var searcharm="%"
    }
    if(request.query.issuccessful!="undefined"){
        var issuccessful= request.query.issuccessful+"%";
    }
    else{
        var issuccessful="%"
    }
    if(request.query.narration !="undefined"){
        var narration= request.query.narration+"%";
    }
    else{
        var narration="%";
    }
    
    console.log(searchQuery);
    console.log(classQuery);
    console.log(issuccessful);
    console.log(searcharm);
    connection.query("SELECT * FROM payments WHERE (studentfirstname LIKE ? OR studentlastname LIKE ? OR studentid LIKE ?) AND (studentclass LIKE ?) AND (status LIKE ?) AND (studentarm LIKE ?) AND (narration LIKE ?) ORDER BY id DESC", [searchQuery, searchQuery, searchQuery, classQuery, issuccessful, searcharm, narration], function(err, res){
        if(err){
            data.error=1;
            data.products="Error in code"+err;
            response.json(data);
        }
        else{
            
            for(var i=0; i<res.length; i++){
                    var d = new Date(res[i]["datepaid"]);
                    console.log(d);
                    var year = d.getFullYear();
                    var day= d.getDate();
                    var month= d.getMonth()+1;
                    var fullDate= year+"-"+month+"-"+day;
                    res[i]["datepaid"]=fullDate;
                }
            data.error=0;
            data.products=res;
            response.json(data);
        }
    }); 
});
router.post("/delete", function(request, response){
     var data={
        error:1,
        products:""
    };
    var idreference=request.body.idreference;

    connection.query("DELETE FROM payments WHERE id=?", [idreference], function(err, res){
        if(err){
            data.error=1;
            data.products="Error deleting";
            console.log(error);
            response.json(data);
        }
        else{
            data.error=0;
            data.products="Row has been removed";
            console.log(res);
            response.json(data);
        }
    });

});

router.get("/transactions", function(request, response){
    if(request.query.filter){
        var filter=request.query.filter+"%";
    }
    else{
        var filter="%";
    }
    
    console.log(filter);
    var data={
        error:1,
        response:"",
        successfulCount:0,
        unsuccessfulCount:0,
        successfulAmount:0
    };
    connection.query("SELECT status, studentclass, narration, amountpaid FROM payments WHERE narration LIKE ?",[filter], function(err, rows){
        if(err){
            data.error=1;
            data.response="Error utilizing code";
            console.log(data);
            response.json(data);
            
        }
        else{
            data.error=0;
            
            for(var i=0; i<rows.length;i++){
                if(rows[i].status=="Successful"){
                    data.successfulCount+=1;
                    data.successfulAmount+= rows[i].amountpaid;
                }
                else{
                    data.unsuccessfulCount+=1;
                }
            }
            data.response=rows;
            response.json(data);
        }
    });

    

});
