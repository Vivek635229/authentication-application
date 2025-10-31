import React, { Component } from "react";
import "./Dashboard.css";
import "./modern-styles.css";

import swal from "sweetalert";
import { withRouter } from "./utils";
import Select from "react-select";
const axios = require("axios");

class Dashboard extends Component {
  // Local SVG fallback image to prevent network errors
  fallbackImage =
    "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='14' fill='%239fa2a5' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

  constructor() {
    super();
    this.state = {
      token: "",
      user: null,
      openProductModal: false,
      openProductEditModal: false,
      id: "",
      name: "",
      desc: "",
      price: "",
      discount: "",
      category: "",
      file: null,
      fileName: "",
      page: 1,
      search: "",
      priceMin: "",
      priceMax: "",
      sortBy: "newest",
      products: [],
      pages: 0,
      loading: false,
      showUserMenu: false,
      showFilters: false,
      categories: [
        "Electronics",
        "Clothing",
        "Books",
        "Home & Garden",
        "Sports",
        "General",
      ],
      imagePreview: null,
      formErrors: {},
      currentStep: 1,
      skeletonLoading: true,
      // React-Select options
      categoryOptions: [
        { value: "", label: "All Categories" },
        { value: "Electronics", label: "Electronics" },
        { value: "Clothing", label: "Clothing" },
        { value: "Books", label: "Books" },
        { value: "Home & Garden", label: "Home & Garden" },
        { value: "Sports", label: "Sports" },
        { value: "General", label: "General" },
      ],
      sortOptions: [
        { value: "newest", label: "Newest First" },
        { value: "price_low", label: "Price: Low to High" },
        { value: "price_high", label: "Price: High to Low" },
        { value: "name", label: "Name A-Z" },
      ],
    };
  }

  // Custom styles for react-select
  getSelectStyles = () => ({
    control: (provided, state) => ({
      ...provided,
      minHeight: "50.5px",
      border: state.isFocused ? "2px solid #3b82f6" : "2px solid #d1d5db",
      borderRadius: "8px",
      boxShadow: "none",
      outline: "none",
      "&:hover": {
        borderColor: "#9ca3af",
      },
      fontSize: "14px",
      backgroundColor: "#ffffff",
      transition: "all 0.2s ease",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#1f2937",
      padding: "12px 16px",
      fontSize: "14px",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
      fontSize: "14px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#1f2937",
      fontSize: "14px",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "8px",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      border: "1px solid #e5e7eb",
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      borderRadius: "8px",
      padding: "4px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#6b7280",
      "&:hover": {
        color: "#374151",
      },
    }),
  });

  // Common input styles
  getInputClasses = (hasError = false) => {
    const baseClasses =
      "w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-all";
    const errorClasses = hasError
      ? "border-red-500 bg-red-50"
      : "border-gray-300";
    return `${baseClasses} ${errorClasses}`;
  };

  // Helper method to handle image load errors
  handleImageError = (e) => {
    // Try to reload the image once before falling back
    const originalSrc = e.target.src;

    // Set a flag to prevent infinite retries
    if (!e.target.hasRetried) {
      e.target.hasRetried = true;

      // Try again after a short delay
      setTimeout(() => {
        e.target.src = originalSrc;
      }, 500);
    } else {
      e.target.src = this.fallbackImage;
      e.target.onError = null; // Prevent infinite error loop
    }
  };
  componentDidMount = () => {
    let token = localStorage.getItem("token");
    let user = localStorage.getItem("user");

    if (!token) {
      this.props.navigate("/login");
    } else {
      this.setState(
        {
          token: token,
          user: user ? JSON.parse(user) : null,
        },
        () => {
          this.getProduct();
        }
      );
    }
  };

  getProduct = () => {
    this.setState({ loading: true, skeletonLoading: true });

    const { page, search, category, priceMin, priceMax, sortBy } = this.state;

    let url = `http://localhost:2000/get-product?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category && category !== "")
      url += `&category=${encodeURIComponent(category)}`;
    if (priceMin) url += `&priceMin=${priceMin}`;
    if (priceMax) url += `&priceMax=${priceMax}`;
    if (sortBy) url += `&sortBy=${sortBy}`;

    axios
      .get(url, {
        headers: {
          token: this.state.token,
        },
      })
      .then((res) => {
        // Immediately update state to show results
        this.setState({
          loading: false,
          skeletonLoading: false,
          products: res.data.products || [],
          pages: res.data.pages || 0,
        });
      })
      .catch((err) => {
        swal({
          text: err.response?.data?.errorMessage || "Failed to load products",
          icon: "error",
        });
        this.setState({
          loading: false,
          skeletonLoading: false,
          products: [],
          pages: 0,
        });
      });
  };

  deleteProduct = (id) => {
    axios
      .post(
        "http://localhost:2000/delete-product",
        {
          id: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: this.state.token,
          },
        }
      )
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
        });

        this.setState({ page: 1 }, () => {
          this.pageChange(null, 1);
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
      });
  };

  pageChange = (e, page) => {
    this.setState({ page }, () => {
      this.getProduct();
    });
  };

  handleFilterChange = (filterType, value) => {
    this.setState(
      {
        [filterType]: value,
        page: 1,
      },
      () => {
        this.getProduct();
      }
    );
  };

  handleSelectChange = (selectedOption, actionMeta) => {
    const value = selectedOption ? selectedOption.value : "";
    this.handleFilterChange(actionMeta.name, value);
  };

  toggleFilters = () => {
    this.setState({ showFilters: !this.state.showFilters });
  };

  clearFilters = () => {
    this.setState(
      {
        search: "",
        category: "",
        priceMin: "",
        priceMax: "",
        sortBy: "newest",
        page: 1,
      },
      () => {
        this.getProduct();
      }
    );
  };

  validateForm = () => {
    const { name, desc, price } = this.state;
    const errors = {};

    if (!name.trim()) errors.name = "Product name is required";
    if (!desc.trim()) errors.desc = "Description is required";
    if (!price || isNaN(price) || parseFloat(price) <= 0)
      errors.price = "Valid price is required";

    this.setState({ formErrors: errors });
    return Object.keys(errors).length === 0;
  };

  nextStep = () => {
    if (this.state.currentStep === 1 && this.validateForm()) {
      this.setState({ currentStep: 2 });
    }
  };

  prevStep = () => {
    this.setState({ currentStep: 1 });
  };

  logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.props.navigate("/");
  };

  toggleUserMenu = () => {
    this.setState({ showUserMenu: !this.state.showUserMenu });
  };

  onChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);

      this.setState({
        file: file,
        fileName: file.name,
      });
    } else {
      this.setState({ [e.target.name]: e.target.value });
      if (e.target.name === "search") {
        this.setState({ page: 1 }, () => {
          this.getProduct();
        });
      }
    }
  };

  addProduct = () => {
    if (!this.validateForm()) {
      return;
    }

    const file = new FormData();
    if (this.state.file) {
      file.append("product_image", this.state.file);
    }
    file.append("name", this.state.name);
    file.append("desc", this.state.desc);
    file.append("discount", this.state.discount);
    file.append("price", this.state.price);
    file.append("category", this.state.category || "General");

    axios
      .post("http://localhost:2000/create-product", file, {
        headers: {
          "content-type": "multipart/form-data",
          token: this.state.token,
        },
      })
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
        });

        this.handleProductClose();
        this.setState(
          {
            name: "",
            desc: "",
            discount: "",
            price: "",
            category: "General",
            file: null,
            fileName: "",
            imagePreview: null,
            formErrors: {},
            currentStep: 1,
            page: 1,
          },
          () => {
            this.getProduct();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
        });
        this.handleProductClose();
      });
  };

  updateProduct = () => {
    if (!this.validateForm()) {
      return;
    }

    const file = new FormData();
    if (this.state.file) {
      file.append("product_image", this.state.file);
    }
    file.append("name", this.state.name);
    file.append("desc", this.state.desc);
    file.append("discount", this.state.discount);
    file.append("price", this.state.price);
    file.append("category", this.state.category || "General");

    axios
      .put(`http://localhost:2000/update-product/${this.state.id}`, file, {
        headers: {
          "content-type": "multipart/form-data",
          token: this.state.token,
        },
      })
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
        });

        this.handleProductEditClose();
        this.setState(
          {
            name: "",
            desc: "",
            discount: "",
            price: "",
            category: "General",
            file: null,
            fileName: "",
            imagePreview: null,
            formErrors: {},
            currentStep: 1,
          },
          () => {
            this.getProduct();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
        });
        this.handleProductEditClose();
      });
  };

  handleProductOpen = () => {
    this.setState({
      openProductModal: true,
      id: "",
      name: "",
      desc: "",
      price: "",
      discount: "",
      category: "General",
      fileName: "",
      imagePreview: null,
      formErrors: {},
      currentStep: 1,
    });
  };

  handleProductClose = () => {
    this.setState({ openProductModal: false });
  };

  handleProductEditOpen = (data) => {
    this.setState({
      openProductEditModal: true,
      id: data._id,
      name: data.name,
      desc: data.desc,
      price: data.price,
      discount: data.discount,
      category: data.category || "General",
      fileName: data.image,
      imagePreview: data.image
        ? `http://localhost:2000/uploads/${data.image}`
        : null,
      formErrors: {},
      currentStep: 1,
    });
  };

  handleProductEditClose = () => {
    this.setState({ openProductEditModal: false });
  };

  render() {
    const { user } = this.state;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600 mr-8">
                  ProductHub
                </h1>
                <nav className="hidden md:flex space-x-6">
                  <span className="text-gray-600 font-medium">Dashboard</span>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={this.handleProductOpen}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Product
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={this.toggleUserMenu}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <img
                          src={`http://localhost:2000/${user.profileImage}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                    <span className="text-sm font-medium">
                      {user?.name || user?.username}
                    </span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {this.state.showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        Signed in as <br />
                        <span className="font-medium text-gray-900">
                          {user?.username}
                        </span>
                      </div>
                      <button
                        onClick={() => this.props.navigate("/profile-edit")}
                        className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Profile
                      </button>
                      <button
                        onClick={this.logOut}
                        className="flex w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || user?.username}!
            </h1>
            <p className="text-gray-600">
              Manage your products efficiently with our powerful dashboard.
            </p>
          </div>

          {/* Advanced Search & Filters */}
          <div className="mb-8 bg-white rounded-xl shadow-sm border p-6 animate-fadeIn">
            <div className="flex  lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={this.state.search}
                    onChange={this.onChange}
                    placeholder="Search by name or description..."
                    className="w-[400px] hover:border-[#9ca3af] pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={this.toggleFilters}
                className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                  />
                </svg>
                Filters
                <svg
                  className={`w-4 h-4 ml-2 transform transition-transform ${
                    this.state.showFilters ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Advanced Filters */}
            {this.state.showFilters && (
              <div className="mt-6 pt-6 border-t animate-slideInUp">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  {/* Category Filter */}
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select
                      value={this.state.categoryOptions.find(
                        (option) =>
                          option.value === this.state.category ||
                          option.value === " "
                      )}
                      onChange={this.handleSelectChange}
                      options={this.state.categoryOptions}
                      styles={this.getSelectStyles()}
                      placeholder="Select category..."
                      isClearable={true}
                      name="category"
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Price Range */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Price
                    </label>
                    <input
                      type="number"
                      value={this.state.priceMin}
                      onChange={(e) =>
                        this.handleFilterChange("priceMin", e.target.value)
                      }
                      placeholder="0"
                      className="w-full px-3 py-3 hover:border-[#9ca3af] border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price
                    </label>
                    <input
                      type="number"
                      value={this.state.priceMax}
                      onChange={(e) =>
                        this.handleFilterChange("priceMax", e.target.value)
                      }
                      placeholder="1000"
                      className="w-full px-3 py-3 hover:border-[#9ca3af] border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Sort Options */}
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <Select
                      value={this.state.sortOptions.find(
                        (option) => option.value === this.state.sortBy
                      )}
                      onChange={this.handleSelectChange}
                      options={this.state.sortOptions}
                      styles={this.getSelectStyles()}
                      placeholder="Choose sorting..."
                      name="sortBy"
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={this.clearFilters}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {this.state.loading && (
            <div className="mb-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-400"
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
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">Loading products...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="bg-white shadow-sm rounded-xl border animate-fadeIn">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Your Products
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {this.state.products.length > 0
                      ? `${this.state.products.length} products found`
                      : "Manage and organize your product catalog"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {this.state.loading && (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Skeleton Loading */}
              {this.state.skeletonLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="card-hover bg-white rounded-xl p-6 border animate-shimmer">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-5 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : this.state.products.length === 0 ? (
                <div className="text-center py-16 animate-fadeIn">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products yet
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Get started by creating your first product. Build your
                    catalog and start selling!
                  </p>
                  <button
                    onClick={this.handleProductOpen}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 inline-flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {this.state.products.map((product, index) => (
                    <div
                      key={product._id || index}
                      className="card-hover bg-white rounded-xl border border-gray-200 overflow-hidden animate-slideInUp"
                      style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="relative aspect-ratio-container">
                        {product.image ? (
                          <img
                            src={`http://localhost:2000/uploads/${product.image}`}
                            alt={product.name}
                            className="product-card-image"
                            onError={this.handleImageError}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <svg
                              className="w-16 h-16 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}

                        {product.discount > 0 && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{product.discount}%
                            </span>
                          </div>
                        )}

                        {product.category && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full border">
                              {product.category}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {product.desc}
                        </p>

                        <div className="flex justify-between items-center mb-5">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-blue-600">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                $
                                {(
                                  parseFloat(product.price) /
                                  (1 - product.discount / 100)
                                ).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => this.handleProductEditOpen(product)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => this.deleteProduct(product._id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 mr-2"
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
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {this.state.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: this.state.pages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => this.pageChange(null, pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === this.state.page
                          ? "bg-blue-50 border-blue-500 text-blue-600 z-10"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      } ${
                        pageNum === 1
                          ? "rounded-l-md"
                          : pageNum === this.state.pages
                          ? "rounded-r-md"
                          : ""
                      }`}>
                      {pageNum}
                    </button>
                  )
                )}
              </nav>
            </div>
          )}
        </main>

        {/* Enhanced Add Product Modal */}
        {this.state.openProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center animate-fadeIn">
            <div className="relative mx-auto p-0 border-0 w-full max-w-2xl shadow-2xl rounded-2xl bg-white animate-scaleIn">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Add New Product
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a new product for your catalog
                  </p>
                </div>
                <button
                  onClick={this.handleProductClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6"
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
                </button>
              </div>

              {/* Progress Steps */}
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        this.state.currentStep >= 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}>
                      1
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Basic Info
                    </span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        this.state.currentStep >= 2
                          ? "bg-blue-600 w-full"
                          : "bg-gray-200 w-0"
                      }`}></div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        this.state.currentStep >= 2
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Image & Details
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Step 1: Basic Information */}
                {this.state.currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={this.state.name}
                        onChange={this.onChange}
                        placeholder="Enter product name"
                        className={this.getInputClasses(
                          this.state.formErrors.name
                        )}
                        style={{ hover: "border-color: #9ca3af" }}
                      />
                      {this.state.formErrors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {this.state.formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="desc"
                        value={this.state.desc}
                        onChange={this.onChange}
                        rows="4"
                        placeholder="Describe your product in detail..."
                        className={`${this.getInputClasses(
                          this.state.formErrors.desc
                        )} resize-none`}
                      />
                      {this.state.formErrors.desc && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {this.state.formErrors.desc}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 ">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={this.state.price}
                          onChange={this.onChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={this.getInputClasses(
                            this.state.formErrors.price
                          )}
                        />
                        {this.state.formErrors.price && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {this.state.formErrors.price}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          name="discount"
                          value={this.state.discount}
                          onChange={this.onChange}
                          placeholder="0"
                          min="0"
                          max="100"
                          className={this.getInputClasses()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <Select
                          value={this.state.categoryOptions.find(
                            (option) => option.value === this.state.category
                          )}
                          onChange={(selectedOption) => {
                            this.setState({
                              category: selectedOption
                                ? selectedOption.value
                                : " ",
                            });
                          }}
                          options={this.state.categoryOptions.filter(
                            (opt) => opt.value !== ""
                          )}
                          styles={this.getSelectStyles()}
                          placeholder="Select category..."
                          name="category"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Image & Final Details */}
                {this.state.currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                        <div className="space-y-1 text-center">
                          {this.state.imagePreview ? (
                            <div className="relative">
                              <img
                                src={this.state.imagePreview}
                                alt="Preview"
                                className="mx-auto h-32 w-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  this.setState({
                                    imagePreview: null,
                                    file: null,
                                    fileName: "",
                                  })
                                }
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                            </div>
                          ) : (
                            <>
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48">
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    type="file"
                                    name="file"
                                    onChange={this.onChange}
                                    accept="image/*"
                                    className="sr-only"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      {this.state.fileName && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {this.state.fileName}
                        </p>
                      )}
                    </div>

                    {/* Preview Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Product Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">
                            {this.state.name || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">
                            ${this.state.price || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">
                            {this.state.category}
                          </span>
                        </div>
                        {this.state.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium text-green-600">
                              {this.state.discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-between items-center pt-6 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-2xl mt-6">
                  <div className="flex items-center space-x-2">
                    {this.state.currentStep === 2 && (
                      <button
                        onClick={this.prevStep}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Back
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-3 ">
                    <button
                      onClick={this.handleProductClose}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>

                    {this.state.currentStep === 1 ? (
                      <button
                        onClick={this.nextStep}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105">
                        Next
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={this.addProduct}
                        className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create Product
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Edit Product Modal */}
        {this.state.openProductEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center animate-fadeIn">
            <div className="relative mx-auto p-0 border-0 w-full max-w-2xl shadow-2xl rounded-2xl bg-white animate-scaleIn">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Edit Product
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Update your product information
                  </p>
                </div>
                <button
                  onClick={this.handleProductEditClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6"
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
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="space-y-6">
                  {/* Current Image Display */}
                  {this.state.imagePreview && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Image
                      </label>
                      <div className="relative inline-block">
                        <img
                          src={this.state.imagePreview}
                          alt="Current product"
                          className="h-24 w-24 object-cover rounded-lg border"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={this.state.name}
                        onChange={this.onChange}
                        className={this.getInputClasses()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <Select
                        value={this.state.categoryOptions.find(
                          (option) => option.value === this.state.category
                        )}
                        onChange={(selectedOption) => {
                          this.setState({
                            category: selectedOption
                              ? selectedOption.value
                              : " ",
                          });
                        }}
                        options={this.state.categoryOptions.filter(
                          (opt) => opt.value !== ""
                        )}
                        styles={this.getSelectStyles()}
                        placeholder="Select category..."
                        name="category"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="desc"
                      value={this.state.desc}
                      onChange={this.onChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-all resize-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={this.state.price}
                        onChange={this.onChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={this.state.discount}
                        onChange={this.onChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image
                    </label>
                    <input
                      type="file"
                      name="file"
                      onChange={this.onChange}
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-all"
                    />
                    {this.state.fileName && (
                      <p className="text-sm text-gray-500 mt-1">
                        Current: {this.state.fileName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 pt-6 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-2xl">
                  <button
                    onClick={this.handleProductEditClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={this.updateProduct}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Update Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Dashboard);
