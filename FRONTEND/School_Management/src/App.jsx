import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi.json"; // Ensure this ABI corresponds to your contract

const CONTRACT_ADDRESS = "0x1636B22539918513b6042283C1Bf65CeF9F1E144";
const CONTRACT_ABI = abi;

export default function SchoolManagement() {
  const [students, setStudents] = useState([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
      } else {
        console.error("MetaMask not detected!");
      }
    };
    initProvider();
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      console.error("Ethereum provider not available.");
      return;
    }
    
    try {
      await provider.send("eth_requestAccounts", []);
      const newSigner = await provider.getSigner();
      setSigner(newSigner);

      const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
      setContract(newContract);
      console.log("Wallet connected!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const registerStudent = async () => {
    if (!contract) {
      console.error("Contract not initialized.");
      return;
    }
  
    console.log("Registering student...");
    console.log("ID:", id, "Name:", name, "Age:", age);
  
    if (!id || !age || isNaN(id) || isNaN(age)) {
      console.error("Invalid ID or Age values.");
      alert("Please provide valid ID and Age.");
      return;
    }
  
    try {
      const studentId = BigInt(id);  
      const studentAge = BigInt(age);
  
      console.log("Converted Student ID:", studentId);
      console.log("Converted Student Age:", studentAge);
  
      const tx = await contract.registerStudent(studentId, name, studentAge);
  
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed!");
  
      alert("Student registered successfully!");
      fetchStudents();
    } catch (error) {
      console.error("Error registering student:", error);
      alert("Registration failed. Please check the console for details.");
    }
  };

  const fetchStudents = async () => {
    if (!contract) {
      console.error("Contract not initialized.");
      return;
    }
  
    try {
      const nextId = await contract.nextId();
      const nextIdNumber = nextId.toNumber ? nextId.toNumber() : Number(nextId);
      const studentList = [];
  
      for (let i = 0; i < nextIdNumber; i++) {
        const student = await contract.getStudent(i);
        studentList.push({
          id: i,
          name: student[0],
          age: student[1].toString(),
        });
      }
  
      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const removeStudent = async (studentId) => {
    if (!contract) {
      console.error("Contract not initialized.");
      return;
    }
  
    try {
      console.log("Removing student with ID:", studentId);
  
      const idBigInt = BigInt(studentId);
  
      const tx = await contract.removeStudent(idBigInt);
      console.log("Transaction sent:", tx.hash);
      
      await tx.wait();
      console.log("Transaction confirmed!");
  
      alert(`Student with ID ${studentId} removed successfully!`);
      fetchStudents();
    } catch (error) {
      console.error("Error removing student:", error);
      alert("Failed to remove student. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex flex-row items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">School Management System</h1>
      <button
        onClick={connectWallet}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Connect Wallet
      </button>
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={registerStudent}
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Register Student
        </button>
      </div>
      <button
        onClick={fetchStudents}
        className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
      >
        Fetch Students
      </button>
      <div className="mt-4 w-full max-w-md">
        {students.map((student, index) => (
          <div key={index} className="bg-white p-4 mb-2 rounded shadow-md flex justify-between items-center">
            <div>
              <p><strong>ID:</strong> {student.id}</p>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Age:</strong> {student.age}</p>
            </div>
            <button 
              onClick={() => removeStudent(student.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
