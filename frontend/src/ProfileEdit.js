import React, { Component } from "react";
import swal from "sweetalert";
import { withRouter } from "./utils";
const axios = require("axios");

class ProfileEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      username: "",
      currentProfileImage: null,
      newProfileImage: null,
      imagePreview: null,
      loading: false,
      uploadLoading: false,
      errors: {},
      user: null,
      token: "",
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem("token");
    let user = localStorage.getItem("user");

    if (!token) {
      this.props.navigate("/");
    } else {
      const userData = JSON.parse(user);
      this.setState({
        token: token,
        user: userData,
        name: userData.name || "",
        username: userData.username || "",
        currentProfileImage: userData.profileImage || null,
        imagePreview: userData.profileImage
          ? `http://localhost:2000/uploads/${userData.profileImage}`
          : null,
      });
    }
  };

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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        swal({
          text: "Please select a valid image file (JPG, JPEG, PNG)",
          icon: "error",
          type: "error",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        swal({
          text: "Please select an image smaller than 5MB",
          icon: "error",
          type: "error",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setState({
          imagePreview: e.target.result,
          newProfileImage: file,
          errors: { ...this.state.errors, profileImage: "" },
        });
      };
      reader.readAsDataURL(file);
    } else {
      this.setState({
        [e.target.name]: e.target.value,
        errors: { ...this.state.errors, [e.target.name]: "" },
      });
    }
  };

  validateForm = () => {
    const { name, username } = this.state;
    const errors = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  updateProfile = () => {
    if (!this.validateForm()) return;

    this.setState({ loading: true });

    const formData = new FormData();
    formData.append("name", this.state.name);
    formData.append("username", this.state.username);

    if (this.state.newProfileImage) {
      formData.append("profileImage", this.state.newProfileImage);
    }

    axios
      .put("http://localhost:2000/update-profile", formData, {
        headers: {
          "content-type": "multipart/form-data",
          token: this.state.token,
        },
      })
      .then((res) => {
        this.setState({ loading: false });

        // Update localStorage with new user data
        localStorage.setItem("user", JSON.stringify(res.data.user));

        swal({
          text: "Profile updated successfully!",
          icon: "success",
          type: "success",
        }).then(() => {
          this.props.navigate("/dashboard");
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
            type: "error",
          });
        } else {
          swal({
            text: "Failed to update profile!",
            icon: "error",
            type: "error",
          });
        }
      });
  };

  removeProfileImage = () => {
    swal({
      title: "Remove Profile Picture?",
      text: "Are you sure you want to remove your profile picture?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willRemove) => {
      if (willRemove) {
        this.setState({
          imagePreview: null,
          newProfileImage: null,
          currentProfileImage: null,
        });
      }
    });
  };

  handleImageError = (e) => {
    // Set fallback avatar
    e.target.src =
      "data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='48' fill='%239fa2a5' text-anchor='middle' dy='.3em'%3E👤%3C/text%3E%3C/svg%3E";
  };

  render() {
    const { name, username, imagePreview, loading, errors, user } = this.state;

    if (!user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Edit Profile
            </h1>
            <p className="text-gray-600">
              Update your personal information and profile picture
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-10 text-center relative">
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => this.props.navigate("/dashboard")}
                  className="flex items-center text-white hover:text-blue-200 transition-colors">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Back to Dashboard
                </button>
              </div>

              {/* Profile Image Section */}
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                      onError={this.handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Upload Button */}
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                  <input
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={this.onChange}
                  />
                </div>

                {/* Remove Image Button */}
                {imagePreview && (
                  <button
                    onClick={this.removeProfileImage}
                    className="text-red-600 hover:text-red-700 text-sm transition-colors flex items-center mx-auto mb-3">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove Picture
                  </button>
                )}
              </div>

              <div className="mt-5">
                <h1 className="text-4xl font-bold  mb-1">{user.name}</h1>
                <p className="text-blue-700">@{user.username}</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={this.getInputClasses(!!errors.name)}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={this.onChange}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Username Field */}
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
              </div>

              {/* Image Upload Instructions */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Profile Picture Guidelines
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Supported formats: JPG, JPEG, PNG</li>
                        <li>Maximum file size: 5MB</li>
                        <li>Recommended dimensions: 400x400px or higher</li>
                        <li>Square images work best for profile pictures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => this.props.navigate("/dashboard")}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>

                <button
                  onClick={this.updateProfile}
                  disabled={loading}
                  className="flex-1 py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white  bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ProfileEdit);
