const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
let workItems = [];
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect(
    "mongodb+srv://zobzn1:bekasika400@cluster0.c7hsa.mongodb.net/todoListDB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .then((res) => console.log("mongoose connected"));

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name required"],
  },
});

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "By food",
});

const item2 = new Item({
  name: "Make breakfast",
});

const item3 = new Item({
  name: "Eat breakfast",
});
const defaultItems = [item1, item2, item3];
let todos = [];

app.get("/", (req, res) => {
  Item.find({}, (err, todos) => {
    if (!err) {
      if (todos.length === 0) {
        console.log("No Items");
        Item.insertMany(defaultItems, (err) => {
          if (!err) {
            console.log("Default items succesfully added");
          } else {
            console.log("1 " + err);
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: todos });
      }
    } else {
      console.log("2 " + err);
    }
  });
});

app.post("/", (req, res) => {
  const listName = req.body.list;
  const nextItem = new Item({
    name: req.body.newItem,
  });
  if (listName === "Today") {
    nextItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(nextItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const idToDelete = req.body.deleteCheckbox.trim();
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(idToDelete, (err) => {
      console.log("3 " + err);
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: idToDelete } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:listName", (req, res) => {
  const listName = _.capitalize(req.params.listName);
  console.log(listName);
  List.findOne({ name: listName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.listen(port, () => {
  console.log("Server started on port " + port);
});
