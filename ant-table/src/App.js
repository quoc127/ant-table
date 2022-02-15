import React, {useContext, useState, useEffect, useRef} from "react";
import "antd/dist/antd.css";
import reactDom from "react-dom";
import {Input, Table, Button, Icon, Popconfirm, Form} from "antd";
import "./App.css";
import EditableTable from "./components/edittable";

const EditableContext = React.createContext(null);

const EditTableRow = ({index, ...props}) => {
  const [form] = Form.useForm();
  return(
    <Form form={form} component="false">
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children, 
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  
  useEffect(() => {
    if(editing){
      inputRef.current.focus();
    }
  },[editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try{
      const values = await form.setFieldValue();
      toggleEdit();
      handleSave({...record, ...values});
    }catch(errInfo){
      console.log("Save failed", errInfo);
    }
  };

  let childNode = children;

  if(editable){
    childNode = editing ? (
      <Form.Item 
      style={{
        margin: 0,
      }} 
      name="dataIndex" 
      rules={[
        {
        required: "true",
        message: `${title} is required`,
        },
      ]}
      > 
        <Input ref={inputRef} onPressEnter={save} onBlur={save}/>
      </Form.Item>
    ) : (
      <div
      className="editable-cell-value-wrap"
      style={{
        paddingRight: 24,
      }}
      onClick = {toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>
};

class crudTable extends React.Component{
  constructor (props){
    super(props);
    this.columns =[
      {
        title: "name",
        dataIndex: "name",
        width: "30%",
        editable: true,
      },
      {
        title: "age",
        dataIndex: "age",
      },
      {
        title: "address",
        dataIndex: "address",
      },
      {
        title: "operation",
        dataIndex: "operation",
        render:(_, record) =>
          this.state.dataSource.length >= 1 ?(
            <Popconfirm title="Sure to delete" onConfirm={() => this.handleDelete(record.key)}>
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];
    this.state = {
      dataSource: [
        {
          key: "0",
          name:"Quốc 0",
          age: "22",
          address: "Sông Cầu"
        },
        {
          key: "1",
          name:"Quốc 1",
          age: "22",
          address: "Sông Cầu"
        },
      ],
      count: 2,
    };
  }

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `Quốc ${count}`,
      age: "22",
      address: `Sông Cầu ${count}`,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };
   handleSave = (row) => {
     const newData = [...this.data.dataSource];
     const index = newData.findIndex((item) => row.key === item.key);
     const item = newData[index];
     newData.splice(index, 1, {...item, ...row});
     this.setState({
       dataSource: newData,
     });
   };

   render(){
     const {dataSource} = this.state;
     const component = {
       body: {
         row: EditTableRow,
         cell: EditableCell,
       },
     };

     const columns = this.columns.map((col) => {
      if(!col.editable){
        return col;
      }
      return{
        ...col,
        onCell: (record) => ({
          ...col,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
     });
     return(
       <div>
        <Button 
          onClick={this.handleAdd}
          type="primary"
          style={{marginBottom: 16}}
        >
          Add a row
        </Button>

        <Table 
          components={component}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
               columns={columns}
        />
       </div>
     );
   }
}

export default crudTable;