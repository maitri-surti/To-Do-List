const express = require("express");
const mongoose= require("mongoose");
const _ = require("lodash");

const app = express();



// const date = require(__dirname + "/date.js");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-maitri:Test123@cluster0.mrbsm.mongodb.net/todolistDB",{useNewUrlParser: true,  useUnifiedTopology: true });
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const eat = new Item({
  name: "Eat"
});
const sleep = new Item({
  name: "Sleep"
});
const netflix = new Item({
  name: "Watch Netflix"
});
const defaultItems=[eat, sleep, netflix];

const listSchema= {
  name:String,
  items:[itemsSchema]
};
const List= mongoose.model("List", listSchema);



app.get("/", function (req, res) {
  Item.find({},function(err, foundItems){
    if(err){
      console.log(err);
    }
    else{
      if(foundItems.length==0){
        Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          res.redirect("/");
        }
  })
}
      else{
        res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
      
    }
    
    
  })
  // const day = date.getDate();
  
  //could pass day instead of "Today"
});

app.get("/:newListName",function(req,res){
  const newListName= _.capitalize(req.params.newListName);
  List.findOne({name:newListName},function(err,listItems){
    if(!listItems){
      //Create new list
      const list= new List({
        name: newListName,
        items: defaultItems
      });
      list.save(function(err){
        if(!err){
          res.redirect("/"+ newListName);
        }
      });
      

    }else{
      res.render("list",{ listTitle: listItems.name, newListItems: listItems.items } );
    }
  })
 
  

});

app.post("/", function (req, res) {
  const itemName = req.body.task;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });
  if(listName=="Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }
  
  

  //  newTask = req.body.task;
  // if (req.body.list === "Work List") {
  //   workItems.push(newTask);
  //   res.redirect("/work");
  // } else {
  //   items.push(newTask);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName = req.body.listName;
  if(listName=="Today"){
    Item.findByIdAndDelete(checkedItemId, function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id: checkedItemId}}},function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }

    })
  }
  
})

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });


app.get("/about", function (req, res) {
  res.render("about");
});


app.listen(process.env.PORT || 3000, function () {
  console.log("Started port 3000.");
});
