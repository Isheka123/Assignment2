import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBRow,
  MDBCol,
  MDBContainer,
  MDBBtn,
  MDBPagination,
  MDBPaginationItem,
  MDBPaginationLink,
} from "mdb-react-ui-kit";
import axios from "axios";

function App() {
  const [data, setData] = useState([]);
  const [value, setValue] = useState("");
  const [sort, setSortValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageLimit] = useState(10);
  const [filterValue, setSort] = useState("");
  const [operation, setOperation] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [checkboxes, setCheckboxes] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const port = process.env.PORT || 3000;
  
  const handleCheckboxChange = (id) => {
    const updatedCheckboxes = {
      ...checkboxes,
      [id]: !checkboxes[id],
    };

    setCheckboxes(updatedCheckboxes);

    const updatedSelectedIds = Object.keys(updatedCheckboxes).filter(
      (key) => updatedCheckboxes[key]
    );
    setSelectedIds(updatedSelectedIds);
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    const updatedCheckboxes = {};
    const updatedSelectedIds = [];

    const allSelected = !selectAll;

    data.forEach((item) => {
      updatedCheckboxes[item.id] = allSelected;
      if (allSelected) {
        updatedSelectedIds.push(item.id);
      }
    });

    setCheckboxes(updatedCheckboxes);
    setSelectAll(allSelected);
    setSelectedIds(updatedSelectedIds);
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          try {
            await axios.delete(`http://localhost:${port}/users/${id}`);
          } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            // Handle error for a specific deletion if needed
          }
        })
      );
  
      // Clear checkboxes and selectedIds
      setCheckboxes({});
      setSelectedIds([]);
      // setSelectAll(false);
      // Reset pagination to the first page and load the updated data
      setCurrentPage(0);
      loadUserData(0, 10, 0);
    } catch (error) {
      console.error("Error deleting selected users:", error);
      // Handle error if the deletion request fails
    }
  };
  
 
  const handleUpdate = async (id, updatedItem) => {
    try {
      await axios.put(`http://localhost:3000/users/${id}`, updatedItem);
      const updatedData = data.map((item) => {
        if (item.id === id) {
          return updatedItem;
        }
        return item;
      });
      setData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      // Handle error if the update request fails
    }
  };

 
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      const upData = data.filter((x) => x.id !== id);
      setData(upData);
    } catch (error) {
      console.error("Error deleting user:", error);
      // Handle error if the deletion request fails
    }
    // Implement delete functionality using the user ID (id)
    
  };
  // console.log(data);
  const sortOptions = ["name", "email", "role", "id"];
  useEffect(() => {
    loadUserData(0, 10, 0);
  }, []);
  const loadUserData = async (
    start,
    end,
    increase,
    optType = null,
    sortValue
  ) => {
    switch (optType) {
      case "search":
        setOperation(optType);
        setSort("");
        return await axios
          .get(
            `http://localhost:${port}/users?q=${value}&_start=${start} &_end=${end}`
          )
          .then((response) => {
            setData(response.data);
            setCurrentPage(currentPage + increase);
            // setValue("");
          })
          .catch((error) => console.log(error));

      case "sort":
        setOperation(optType);
        setSort(sortValue);
        return await axios
          .get(
            `http://localhost:${port}/users?_sort=${sortValue}&_order=asc&_start=${start} &_end=${end}`
          )
          .then((response) => {
            setData(response.data);
            setCurrentPage(currentPage + increase);
            // setValue("");
          })
          .catch((error) => console.log(error));
      default:
        return await axios
          .get(`http://localhost:${port}/users?_start=${start} &_end=${end}`)
          .then((response) => {
            setData(response.data);
            setCurrentPage(currentPage + increase);
          })
          .catch((error) => console.log(error));
    }
  };
  // console.log("data :", data);
  // return <div className="App">
  // Om Ganeshaya Namaha
  // </div>;
  const handleSearch = async (e) => {
    e.preventDefault();
    loadUserData(0, 10, 0, "search");
    // return await axios
    //   .get(`http://localhost:3000/users?q=${value}`)
    //   .then((response) => {
    //     setData(response.data);
    //     setValue("");
    //   })
    //   .catch((error) => console.log(error));
  };
  const handleSort = async (e) => {
    // e.preventDefault();
    let value = e.target.value;
    setSortValue(value);
    loadUserData(0, 10, 0, "sort", value);
    //   return await axios
    //     .get(`http://localhost:3000/users?_sort=${value}&_order=asc`)
    //     .then((response) => {
    //       setData(response.data);
    //       setValue("");
    //     })
    //     .catch((error) => console.log(error));
  };
  const handleReset = () => {
    setValue("");
    setSort("");
    setSortValue("");
    setOperation("");
    loadUserData(0, 10, 0);
  };

  const renderPagination = () => {
    if (data.length < 9 && currentPage === 0) {
      return null;
    }
    if (currentPage === 0) {
      return (
        <MDBPagination className="mb-0">
          <MDBPaginationItem>
            <MDBPaginationLink>1</MDBPaginationLink>
          </MDBPaginationItem>
          <MDBPaginationItem>
            <MDBBtn
              onClick={() => loadUserData(10, 20, 1, operation, filterValue)}
            >
              Next
            </MDBBtn>
          </MDBPaginationItem>
        </MDBPagination>
      );
    } else if (currentPage < pageLimit - 1 && data.length === pageLimit) {
      return (
        <MDBPagination className="mb-0">
          <MDBPaginationItem>
            <MDBBtn
              onClick={() =>
                loadUserData(
                  (currentPage - 1) * 10,
                  currentPage * 10,
                  -1,
                  operation,
                  filterValue
                )
              }
            >
              Prev
            </MDBBtn>
          </MDBPaginationItem>
          <MDBPaginationItem>
            <MDBPaginationLink>{currentPage + 1}</MDBPaginationLink>
          </MDBPaginationItem>
          <MDBPaginationItem>
            <MDBBtn
              onClick={() =>
                loadUserData(
                  (currentPage + 1) * 10,
                  (currentPage + 2) * 10,
                  1,
                  operation,
                  filterValue
                )
              }
            >
              Next
            </MDBBtn>
          </MDBPaginationItem>
        </MDBPagination>
      );
    } else {
      return (
        <MDBPagination className="mb-0">
          <MDBPaginationItem>
            <MDBBtn
              onClick={() =>
                loadUserData(
                  (currentPage - 1) * 10,
                  currentPage * 10,
                  -1,
                  operation,
                  filterValue
                )
              }
            >
              Prev
            </MDBBtn>
          </MDBPaginationItem>
          <MDBPaginationItem>
            <MDBPaginationLink>{currentPage + 1}</MDBPaginationLink>
          </MDBPaginationItem>
        </MDBPagination>
      );
    }
  };

  return (
    <MDBContainer>
      <form
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f3f3f3",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        onSubmit={(e) => handleSearch(e)}
      >
        <div style={{ display: "flex", flex: 1 }}>
          <input
            type="text"
            style={{
              flex: 1,
              marginRight: "10px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            placeholder="Search name..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <MDBBtn color="dark" type="submit">
            Search
          </MDBBtn>
          <MDBBtn
            className="mx-2 text-center"
            color="info"
            onClick={() => handleReset()}
          >
            Reset
          </MDBBtn>
          <label style={{ marginRight: "10px", marginTop: "10px" }}>
            Sort By:
          </label>
          <select
            style={{
              width: "30%",
              borderRadius: "5px",
              height: "35px",
              padding: "6px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
            onChange={handleSort}
            value={sort}
          >
            <option value="">Select</option>
            {sortOptions.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}
        >
          <MDBBtn onClick={handleSelectAll}>
            {selectAll ? "Deselect All" : "Select All"}
          </MDBBtn>
          <MDBBtn className="mx-2" color="info" onClick={handleDeleteSelected}>
            Delete Selected
          </MDBBtn>
        </div>
      </form>

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        {/* <h1 className="text-center">React Table</h1> */}
        <MDBRow>
          <MDBCol md="12">
            <MDBTable striped bordered>
              <MDBTableHead dark>
                <tr>
                  <th scope="col">
                    <input
                      type="checkbox"
                      // Handle checkbox state changes here
                    />
                  </th>
                  <th scope="col">Id</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Action</th>
                </tr>
              </MDBTableHead>
              {data.length === 0 ? (
                <MDBTableBody className="align-center mb-0">
                  <tr>
                    <td colSpan="8" className="text-center mb-0">
                      No Data Found
                    </td>
                  </tr>
                </MDBTableBody>
              ) : (
                data.map((item, index) => (
                  <MDBTableBody key={index}>
                    <tr>
                      <td>
                        <input
                          type="checkbox"
                          // Handle checkbox state changes here
                          checked={!!checkboxes[item.id]}
                          onChange={() => handleCheckboxChange(item.id)}
                        />
                      </td>
                      <th scope="row">{index + 1}</th>
                      {Object.keys(item).map((key, idx) => {
                        if (key !== "id") {
                          return (
                            <td key={idx}>
                              {isEditing && item.id === originalValue ? (
                                <input
                                  value={inputValue[key]}
                                  onChange={(e) =>
                                    setInputValue({
                                      ...inputValue,
                                      [key]: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                item[key]
                              )}
                            </td>
                          );
                        } else {
                          return null;
                        }
                      })}
                      <td>
                        <MDBBtn
                          color="danger"
                          size="sm"
                          style={{ marginRight: "5px" }}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </MDBBtn>
                        {isEditing && item.id === originalValue ? (
                          <MDBBtn
                            color="success"
                            size="sm"
                            onClick={() =>
                              handleUpdate(item.id, { ...item, ...inputValue })
                            }
                          >
                            Save
                          </MDBBtn>
                        ) : (
                          <MDBBtn
                            color="warning"
                            size="sm"
                            onClick={() => {
                              setIsEditing(true);
                              setInputValue({ ...item });
                              setOriginalValue(item.id);
                            }}
                          >
                            Edit
                          </MDBBtn>
                        )}
                      </td>
                    </tr>
                  </MDBTableBody>
                ))
              )}
            </MDBTable>
          </MDBCol>
        </MDBRow>

        <div
          style={{
            margin: "auto",
            padding: "15px",
            maxWidth: "250px",
            alignContent: "center",
          }}
        >
          {renderPagination()}
        </div>
      </div>
      <MDBRow></MDBRow>
    </MDBContainer>
  );
}

export default App;
