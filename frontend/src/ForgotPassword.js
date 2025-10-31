import React, { Component } from "react";
import swal from "sweetalert";
import { withRouter } from "./utils";
import "./modern-styles.css";
const axios = require("axios");

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      newPassword: "",
      confirmPassword: "",
      step: 1, // 1: Enter username, 2: Reset password
      loading: false,
      userFound: false,
      errors: {},
    };
  }

  // Input styles
  getInputClasses = (hasError = false) => {
    const baseClasses =
      "w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-all";
    const errorClasses = hasError
      ? "border-red-500 bg-red-50"
      : "border-gray-300";
    return `${baseClasses} ${errorClasses}`;
  };

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      errors: { ...this.state.errors, [e.target.name]: "" },
    });
  };

  validateUsername = () => {
    const { username } = this.state;
    const errors = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  validatePassword = () => {
    const { newPassword, confirmPassword } = this.state;
    const errors = {};

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  checkUser = () => {
    if (!this.validateUsername()) return;

    this.setState({ loading: true });

    axios
      .post("http://localhost:2000/check-user", {
        username: this.state.username,
      })
      .then((res) => {
        this.setState({
          loading: false,
          step: 2,
          userFound: true,
        });
        swal({
          text: "User found! Please enter your new password.",
          icon: "success",
        });
      })
      .catch((err) => {
        this.setState({ loading: false });
        if (
          err.response &&
          err.response.data &&
          err.response.data.errorMessage
        ) {
          swal({
            text: err.response.data.errorMessage,
            icon: "error",
          });
        } else {
          swal({
            text: "Username not found!",
            icon: "error",
          });
        }
      });
  };

  resetPassword = () => {
    if (!this.validatePassword()) return;

    this.setState({ loading: true });

    axios
      .post("http://localhost:2000/reset-password", {
        username: this.state.username,
        newPassword: this.state.newPassword,
      })
      .then((res) => {
        this.setState({ loading: false });
        swal({
          text: "Password reset successfully!",
          icon: "success",
        }).then(() => {
          this.props.navigate("/login");
        });
      })
      .catch((err) => {
        this.setState({ loading: false });
        if (
          err.response &&
          err.response.data &&
          err.response.data.errorMessage
        ) {
          swal({
            text: err.response.data.errorMessage,
            icon: "error",
          });
        } else {
          swal({
            text: "Failed to reset password!",
            icon: "error",
          });
        }
      });
  };

  render() {
    const { step, loading, username, newPassword, confirmPassword, errors } =
      this.state;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0118 9z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 1 ? "Forgot Password?" : "Reset Password"}
              </h2>
              <p className="text-gray-600">
                {step === 1
                  ? "Enter your username to reset your password"
                  : "Enter your new password"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step >= 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                  1
                </div>
                <div
                  className={`h-1 w-16 ${
                    step > 1 ? "bg-blue-500" : "bg-gray-200"
                  }`}></div>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step >= 2
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                <span>Verify User</span>
                <span>New Password</span>
              </div>
            </div>

            {/* Step 1: Username Input */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className={this.getInputClasses(!!errors.username)}
                    placeholder="Enter your username"
                    value={username}
                    onChange={this.onChange}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>

                <button
                  onClick={this.checkUser}
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
                  {loading ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {loading ? "Checking..." : "Verify User"}
                </button>
              </div>
            )}

            {/* Step 2: Password Reset */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        User <strong>{username}</strong> verified successfully!
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className={this.getInputClasses(!!errors.newPassword)}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={this.onChange}
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={this.getInputClasses(!!errors.confirmPassword)}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={this.onChange}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => this.setState({ step: 1, errors: {} })}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                    Back
                  </button>
                  <button
                    onClick={this.resetPassword}
                    disabled={loading}
                    className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
                    {loading ? (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0118 9z"
                        />
                      </svg>
                    )}
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </div>
            )}

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <button
                onClick={() => this.props.navigate("/login")}
                className="text-gray-600 hover:text-gray-500 text-sm transition-colors flex items-center justify-center mx-auto">
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
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ForgotPassword);
