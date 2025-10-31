import React, { Component } from "react";
import swal from "sweetalert";
import { withRouter } from "./utils";
import "./modern-styles.css";
const axios = require("axios");

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      username: "",
      password: "",
      confirm_password: "",
      profileImage: null,
      profileImagePreview: null,
      loading: false,
    };
  }

  onChange = (e) => {
    if (e.target.name === "profileImage") {
      const file = e.target.files[0];
      if (file) {
        this.setState({
          profileImage: file,
          profileImagePreview: URL.createObjectURL(file),
        });
      }
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }
  };

  register = () => {
    if (this.state.password !== this.state.confirm_password) {
      swal({
        text: "Passwords do not match!",
        icon: "error",
        type: "error",
      });
      return;
    }

    this.setState({ loading: true });

    const formData = new FormData();
    formData.append("name", this.state.name);
    formData.append("username", this.state.username);
    formData.append("password", this.state.password);

    if (this.state.profileImage) {
      formData.append("file", this.state.profileImage);
    }

    axios
      .post("http://localhost:2000/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        this.setState({ loading: false });
        swal({
          text: res.data.title,
          icon: "success",
          type: "success",
        });
        this.props.navigate("/login");
      })
      .catch((err) => {
        this.setState({ loading: false });
        swal({
          text: err.response?.data?.errorMessage || "Registration failed",
          icon: "error",
          type: "error",
        });
      });
  };

  render() {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              ProductHub
            </h1>
            <h2 className="text-2xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="text-gray-600 mt-2">
              Join thousands of users managing their products efficiently
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture (Optional)
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300 mb-3">
                    {this.state.profileImagePreview ? (
                      <img
                        src={this.state.profileImagePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <label
                    htmlFor="profileImage"
                    className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    Choose Photo
                  </label>
                  <input
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={this.onChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={this.state.name}
                    onChange={this.onChange}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={this.state.username}
                    onChange={this.onChange}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Choose a unique username"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={this.state.password}
                    onChange={this.onChange}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={this.state.confirm_password}
                    onChange={this.onChange}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={this.register}
                  disabled={
                    this.state.name === "" ||
                    this.state.username === "" ||
                    this.state.password === "" ||
                    this.state.confirm_password === "" ||
                    this.state.loading
                  }
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {this.state.loading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  )}
                  {this.state.loading
                    ? "Creating account..."
                    : "Create Account"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => this.props.navigate("/login")}
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  Sign in to your account
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => this.props.navigate("/")}
                className="text-gray-600 hover:text-gray-500 text-sm transition-colors flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Register);
