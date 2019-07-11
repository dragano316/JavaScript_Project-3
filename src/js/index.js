import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader , clearLoader } from './views/base';
//global state of the app
//search object
//current recipe object
//shopping list opject
//liked recipes
const state={};
//search Controller

const controlSearch = async ()=>{
	//1)get query from view
	const query=searchView.getInput();
	// console.log(query);
	if(query){
		//2)new search object and add it to state
		state.search=new Search(query);
		//3)prepare the userinterface for results
		console.log(state.search);


		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);
		//4)Search for recipes
		
		await state.search.getResults();
		// state.recipe.parseIngredients();
		//render results on ui
		clearLoader();
		searchView.renderResults(state.search.result);
	}
	};


elements.searchForm.addEventListener('submit', e=>{
	e.preventDefault();
	controlSearch();
});
// const search=new Search('pizza');
// console.log(search);
elements.searchResPages.addEventListener('click',e=>{
	const btn=e.target.closest('.btn-inline');
	if(btn){
		const goToPage=parseInt(btn.dataset.goto,10);
		searchView.clearResults();
		searchView.renderResults(state.search.result,goToPage);
		// console.log(gotoPage);
	}
});
/*

Recipe Controller
*/
// const r=new Recipe();
// r.getRecipe();
const controlRecipe= async ()=>{
	const id=window.location.hash.replace('#', '');
	console.log(id);

	if(id){
		//prepare ui for chnages
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		//create new recipe object
		if(state.search) {searchView.highlightSelected(id);}


		state.recipe=new Recipe(id);

		//get recipe data
		try{
		await state.recipe.getRecipe();
		state.recipe.parseIngredients();

		// calc servings and time
		state.recipe.calcTime();
		state.recipe.calcServings();
		//render recipe
		// console.log(state.recipe);
		}catch(error){
		alert('error in recipeview');
	}
	clearLoader();
	console.log(state.recipe);
	recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
	}
};


// window.addEventListener('hashchange',controlRecipe);
// window.addEventListener('load',controlRecipe);

['hashchange','load'].forEach(event=>window.addEventListener(event,controlRecipe));

//handling recipe buttonclicks
const controlList=()=>{
	if(!state.list)state.list=new List();

	//add each ingredient to list
	state.recipe.ingredients.forEach(el=>{
		const item=state.list.addItem(el.count,el.unit,el.ingredient);
listView.renderItem(item);
	});
};

//handle delete and update list item events
elements.shopping.addEventListener('click',e=>{
	const id=e.target.closest('.shopping__item').dataset.itemid;



	//handle dlete button

	if(e.target.matches('.shopping__delete,.shopping__delete *')){
		state.list.deleteItem(id);
		listView.deleteItem(id);
		//handlethe update
	}else if(e.target.matches('.shopping__count-value')){
		const value=parseFloat(e.target.value,10);
		state.list.updateCount(id,value);

	}

});
//state.likes=new Likes();

const controlLike=()=>{
	if(!state.likes){state.likes=new Likes();}
	const currentID=state.recipe.id;
	//user has not liked current recipe

	if(!state.likes.isLiked(currentID)){
		//add like to the data
		const newLike=state.likes.addLike(
			currentID,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
	);
		//toggle the like button
		likesView.toggleLikeBtn(true);

		// console.log(state.likes);


		//add like to the ui list
		likesView.renderLike(newLike);

	}else{

		//remove like from the state
		state.likes.deleteLike(currentID);


		//toggle the like button
		likesView.toggleLikeBtn(false);

		//remove like from the ui list

		likesView.deleteLike(currentID);

	}
	likesView.toggleLikeMenu(state.likes.getNumLikes());

};

//restore liked recipes on page load
window.addEventListener('load',()=>{
	state.likes=new Likes();

	//restore likes
	state.likes.readStorage();

	likesView.toggleLikeMenu(state.likes.getNumLikes());

	//render the existing likes
	state.likes.likes.forEach(like=>likesView.renderLike(like));
});



elements.recipe.addEventListener('click',e=>{
	if(e.target.matches('.btn-decrease,.btn-decrease *')){
		if(state.recipe.servings>1){

			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	}
	else if(e.target.matches('.btn-increase,.btn-increase *')){
	state.recipe.updateServings('inc');	
	recipeView.updateServingsIngredients(state.recipe);
	}else if(e.target.matches('.recipe__btn--add,.recipe__btn--add *')){

		controlList();
	}
	else if(e.target.matches('.recipe__love, .recipe__love *')){
		controlLike();
	}
});
