const express = require("express");
const path = require("path");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let database = null;

const initializeServerAndDb = async () => {
  try {
    database = await sqlite.open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started on PORT 3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeServerAndDb();

app.get("/todos/", async (req, res) => {
  const { status, priority, search_q = "" } = req.query;
  let getTodoquery = "";

  if (status !== undefined && priority !== undefined) {
    getTodoQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%' AND status = '${status}' AND priority = '${priority}';
        `;
  } else if (status !== undefined) {
    getTodoQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%' AND status = '${status}';
        `;
  } else if (priority !== undefined) {
    getTodoQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';
        `;
  } else {
    getTodoQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%'
        `;
  }

  const data = await database.all(getTodoQuery);
  res.send(data);
});

// API 2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  const getTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId};
    `;

  const data = await database.get(getTodoQuery);
  res.send(data);
});

// API 3
app.post("/todos/", async (req, res) => {
  const { todo, priority, status } = req.body;
  const createTodoQuery = `
    INSERT INTO todo(todo, priority, status)
    VALUES('${todo}', '${priority}', '${status}');
    `;

  await database.run(createTodoQuery);
  res.send("Todo Successfully Added");
});

// API 4
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  const { status, priority, todo } = req.body;

  let condition = "";
  let value = null;
  let responseMsg = "";

  switch (true) {
    case status !== undefined:
      condition = "status";
      value = status;
      responseMsg = "Status";
      break;
    case priority !== undefined:
      condition = "priority";
      value = priority;
      responseMsg = "Priority";
      break;
    case todo !== undefined:
      condition = "todo";
      value = todo;
      responseMsg = "Todo";
      break;
  }

  const updateTodoQuery = `
    UPDATE todo SET 
    ${condition} = '${value}'
    WHERE id = ${todoId};
    `;

  await database.run(updateTodoQuery);

  res.send(`${responseMsg} Updated`);
});

// API 5
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};
    `;

  await database.run(deleteTodoQuery);

  res.send("Todo Deleted");
});

module.exports = app;
