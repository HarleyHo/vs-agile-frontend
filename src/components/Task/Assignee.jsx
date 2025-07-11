import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { TempTaskContext } from "../../contexts/TaskContext";
import { Avatar, Select, Space } from "antd";

function Assignee() {
  const { users } = useContext(UserContext);
  const { tempTask, setTempTask, handleBlur } = useContext(TempTaskContext);

  const assignees = [];
  users
    .filter((user) => user.role === 1)
    .map((user) => {
      assignees.push({
        id: user.id,
        label: <Avatar src={user.iconUrl} />,
        value: user.name,
      });
    });

  const handleChange = (e) => {
    setTempTask((prev) => ({
      ...prev,
      assignee: assignees.find((assignee) => assignee.value === e).id,
    }));
  };

  return (
    <Select
      value={assignees.find(
        (assignee) => assignee.id === tempTask.assigneeId
      )}
      options={assignees}
      style={{ width: 120 }}
      onChange={handleChange}
      onBlur={handleBlur}
      optionRender={(option) => (
        <Space>
          <div>{option.data.label}</div>
          {option.data.value}
        </Space>
      )}
    />
  );
}

export default Assignee;
