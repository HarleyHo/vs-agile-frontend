import "./board.css";
import { useState, useEffect, useRef, useContext } from "react";
import {
  closestCorners,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Column from "./Column";
import { arrayMove } from "@dnd-kit/sortable";
import { TaskContext, CountContext } from "../../contexts/TaskContext";
import { UserContext } from "../../contexts/UserContext";
import { Avatar } from "antd";
import { fetchTasks } from "../../services/taskService";
import { CurrentEventIdContext } from "../../contexts/EventContext";

function Board() {
  const [columns, setColumns] = useState([
    { title: "To Do", tasks: [], status: 0 },
    { title: "In Progress", tasks: [], status: 1 },
    { title: "Done", tasks: [], status: 2 },
  ]);

  const [tasks, setTasks] = useState([]);
  const { currentEventId } = useContext(CurrentEventIdContext);

  useEffect(() => {
    fetchTasks({ eventId: currentEventId }).then((result) => {
      setTasks([...result.data]);
    });
  }, [currentEventId, setTasks]);

  useEffect(() => {
    setColumns((prevColumns) => {
      return prevColumns.map((col) => ({
        ...col,
        tasks: tasks.filter((task) => task.status === col.status),
      }));
    });
  }, [tasks]);

  const findTargetColumn = ({ id }) => {
    if (!id) return;

    if (columns.some((col) => col.status === id)) {
      return columns.find((col) => col.status === id).status ?? NaN;
    } else {
      return tasks.find((task) => task.id === id).status ?? NaN;
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    const activeColumn = findTargetColumn({ id: active.id }) ?? NaN;
    const overColumn = findTargetColumn({ id: over.id }) ?? NaN;

    if (
      !Number.isFinite(activeColumn) ||
      !Number.isFinite(overColumn) ||
      activeColumn === overColumn
    )
      return;

    setTasks((prevTasks) => {
      return prevTasks.map((task) =>
        task.id === active.id ? { ...task, status: overColumn } : task
      );
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const activeColumn = findTargetColumn({ id: active.id }) ?? NaN;
    const overColumn = findTargetColumn({ id: over.id }) ?? NaN;

    if (
      !Number.isFinite(activeColumn) ||
      !Number.isFinite(overColumn) ||
      activeColumn !== overColumn
    )
      return;

    let columnTasks = columns.find((col) => col.status === activeColumn).tasks;

    const activeIndex = columnTasks.findIndex((task) => task.id === active.id);
    const overIndex = columnTasks.findIndex((task) => task.id === over.id);
    columnTasks = arrayMove(columnTasks, activeIndex, overIndex);
    setColumns((prevColumns) => {
      return prevColumns.map((col) =>
        col.status === activeColumn ? { ...col, tasks: columnTasks } : col
      );
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  );

  const newTaskCount = useRef(1);

  const { users } = useContext(UserContext);

  return (
    <div className="task-box">
      <header className="board-header">
        <h1 className="board-title">Board</h1>
      </header>
      <Avatar.Group>
        {users.map((user) => (
          <Avatar src={user.iconUrl} />
        ))}
      </Avatar.Group>
      <DndContext
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
        sensors={sensors}
      >
        <div className="board-body">
          {columns.map((column) => (
            <TaskContext.Provider key={column.status} value={{ setTasks }}>
              <CountContext.Provider
                key={column.status}
                value={{ newTaskCount }}
              >
                <Column key={column.status} column={column} />
              </CountContext.Provider>
            </TaskContext.Provider>
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default Board;
