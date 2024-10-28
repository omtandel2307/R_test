import React, { Component } from "react";
import Form from "./components/Form.js";
import RecipeList from "./components/RecipeList";
import AddRecipe from "./components/AddRecipe.js";
import { Tabs, Tab, TabList, TabPanel, TabPanels, Box } from "@chakra-ui/react";
import RecipeLoading from "./components/RecipeLoading.js";
import Nav from "./components/Navbar.js";
import SearchByRecipe from "./components/SearchByRecipe.js";
import UserProfile from "./components/UserProfile.js";
import { SignedIn, SignedOut, SignInButton, UserButton, ClerkProvider, useUser } from '@clerk/clerk-react';
import recipeDB from "./apis/recipeDB";

// Main component of the project
class App extends Component {
  constructor() {
    super();

    this.state = {
      cuisine: "",
      ingredients: new Set(),
      recipeList: [],
      recipeByNameList: [],
      isLoading: false,
      isProfileView: false,
    };
  }

  handleBookMarks = () => {
    this.setState({
      isProfileView: true
    });
  };

  handleProfileView = () => {
    this.setState({
      isProfileView: false
    });
  };

  handleSubmit = async (formDict) => {
    this.setState({
      isLoading: true,
      ingredients: formDict["ingredient"],
      cuisine: formDict["cuisine"]
    });

    const items = Array.from(formDict["ingredient"]);
    const cuis = formDict["cuisine"];
    this.getRecipeDetails(items, cuis);
  };

  handleRecipesByName = (recipeName) => {
    this.setState({
      isLoading: true
    });

    recipeDB.get("/recipes/getRecipeByName", {
      params: { recipeName }
    }).then(res => {
      this.setState({
        recipeByNameList: res.data.recipes,
        isLoading: false
      });
    }).catch(err => console.log(err));
  };

  getRecipeDetails = async (ingredients, cuisine) => {
    try {
      const response = await recipeDB.get("/recipes", {
        params: {
          CleanedIngredients: ingredients,
          Cuisine: cuisine
        }
      });
      this.setState({
        recipeList: response.data.recipes,
        isLoading: false
      });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    return (
      <div>
        <Nav handleBookMarks={this.handleBookMarks} />
        
        {/* Check if the user is signed in */}
        <SignedIn>
          {this.state.isProfileView ? (
            <UserProfile handleProfileView={this.handleProfileView} />
          ) : (
            <Tabs variant="soft-rounded" colorScheme="green">
              <TabList ml={10}>
                <Tab>Search Recipe</Tab>
                <Tab>Add Recipe</Tab>
                <Tab>Search Recipe By Name</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Box display="flex">
                    <Form sendFormData={this.handleSubmit} />
                    {this.state.isLoading ? <RecipeLoading /> : <RecipeList recipes={this.state.recipeList} />}
                  </Box>
                </TabPanel>
                <TabPanel>
                  <AddRecipe />
                </TabPanel>
                <TabPanel>
                  <SearchByRecipe sendRecipeData={this.handleRecipesByName} />
                  {this.state.isLoading ? <RecipeLoading /> : <RecipeList recipes={this.state.recipeByNameList} />}
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
          {/* Display the user button for Clerk (e.g., Profile/Logout) */}
          <UserButton />
        </SignedIn>

        {/* Show sign-in button if not signed in */}
        <SignedOut>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <SignInButton />
          </div>
        </SignedOut>
      </div>
    );
  }
}

export default App;
