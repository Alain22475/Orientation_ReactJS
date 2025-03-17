import React, { useEffect, useState } from 'react';
import './styles/ManageStudents.css'; // Optional CSS for styling
import Callapi from '../utils/callApi';
import { backend_path } from '../utils/enum';

const ManageStudents = () => {
  const [students, setStudents] = useState([]); // Student records
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false); // Track editing mode



  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await Callapi.get(backend_path.DISPLAY_STUDENTS);
      console.log("Fetched students:", response.data); // Debugging
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]); // Ensure state is always an array
      }
    } catch (error) {
      setError(`Error fetching students: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStudents();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };
  

// Handle form submission (Add or Update)
const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match before making API call
    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    setLoading(true);
    try {
        if (isEditing) {
            // Ensure ID is valid before updating
            if (!formData.id) {
                alert('Error: Student ID is undefined!');
                return;
            }

            // Update existing student
            const response = await Callapi.put(
                `${backend_path.UPDATE_STUDENT}${formData.id}`,
                formData
            );

            if (response.data) {
                setStudents((prev) =>
                    prev.map((student) =>
                        student.id === formData.id ? response.data : student
                    )
                );
                alert('Student updated successfully!');
            }
        } else {
            // Add new student
            const response = await Callapi.post(backend_path.REGISTER, formData);
            if (response.data) {
                setStudents((prev) => [...prev, response.data]);
                alert('Student added successfully!');
            }
        }
        resetForm();
    } catch (error) {
        setError(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
        setLoading(false);
    }
};


  // Reset form data
  const resetForm = () => {
    setFormData({
      id: null,
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

  // Handle edit button click
  const handleEdit = (student) => {
    console.log("Editing student:", student); // Debugging: Log the student object
    // Ensure student object has a studentId
    if (student && student.studentId) {
        setFormData({
            ...student,
            id: student.studentId // Set the id to studentId for the update
        }); // Set form data with student details
        setIsEditing(true); // Set editing mode to true
    } else {
        console.error("Error: Student object is invalid or does not have an ID!");
    }
};


  // Handle delete button click
  const handleDelete = async (id) => {
    if (!id) {
      console.error("Error: Student ID is undefined!");
      return;
    }
  
    if (window.confirm('Are you sure you want to delete this student?')) {
      setLoading(true);
      try {
        console.log(`Deleting student with ID: ${id}`); // Debugging
        await Callapi.delete(`${backend_path.DELETE_STUDENT}${id}`);
        setStudents(prev => prev.filter(student => student.id !== id));
        alert('Student deleted successfully!');
      } catch (error) {
        setError(`Error deleting student: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };
  

  // Filter students based on search term with safe checks
  const filteredStudents = students
    .filter(student => student && typeof student === 'object') // Ensure valid objects
    .filter(student => 
      (student.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="manage-students-container">
      <h2>Manage Students</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {/* Student Form */}
      {formData && (
  <form onSubmit={handleSubmit} className="student-form">
    <input
      type="text"
      name="fullName"
      placeholder="Full Name"
      value={formData.fullName || ""}
      onChange={handleChange}
      required
    />
    <input
      type="text"
      name="phone"
      placeholder="Phone"
      value={formData.phone || ""}
      onChange={handleChange}
      required
    />
    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email || ""}
      onChange={handleChange}
      required
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      value={formData.password || ""}
      onChange={handleChange}
      required
    />
    <input
      type="password"
      name="confirmPassword"
      placeholder="Confirm Password"
      value={formData.confirmPassword || ""}
      onChange={handleChange}
      required
    />
    <button type="submit" className="submit-button">
      {isEditing ? "Update Student" : "Add Student"}
    </button>
    {isEditing && (
      <button type="button" onClick={resetForm} className="cancel-button">
        Cancel
      </button>
    )}
  </form>
)}


      {/* Student List Table */}
      <table className="students-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {filteredStudents.length === 0 ? (
    <tr>
      <td colSpan="4" className="no-data">No students found</td>
    </tr>
  ) : (
    filteredStudents.map((student, index) => (
      <tr key={student.id || index}>
        <td>{student.fullName}</td>
        <td>{student.phone}</td>
        <td>{student.email}</td>
        <td>
          <button 
            onClick={() => handleEdit(student)} 
            className="edit-button"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDelete(student.id)} 
            className="delete-button"
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
  );
};

export default ManageStudents;
