'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { restartLoading } from '../src/app/store/SearchResults/searchResultSlice';
import { addLoginStatus } from '../src/app/store/LoggedIn/loginSlice';
import { updateData } from '../src/app/store/UserData/userDataSlice';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const dispatch = useDispatch();

  function getCookie(name) {
    const cookies = document.cookie.split('; ');
    const cookiePair = cookies.find(cookie => cookie.startsWith(name + '='));
    if (cookiePair) {
      const value = cookiePair.split('=')[1];
      return value;
    } else {
      return null;
    }
  }

  const storedUser = getCookie('username');
  const storedPass = getCookie('password');

  // userID: id, name: display_name, email 
  console.log(storedUser, storedPass)

    const checkCookies = async () => {
      try {
        const settings = {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: storedUser,
            password: storedPass,
          }),
        };

        if (storedUser && storedPass) {
          const data = await fetch("/api/auth/signin", settings);
          const response = await data.json();

          console.log('response name', response.name);
          console.log('response email', response.email);
          console.log('reponse id', response.userID);

          if (response.message === "Success!") {
            dispatch(addLoginStatus(true));
            dispatch(
              updateData({
                name: response.name,
                email: response.email,
                id: response.userID,
              })
            );
          }
        }
      } catch (e) {
        console.log('Cookie issue')
      }
    };

checkCookies();

  // this router method - when invoked - forces the client to the endpoint of your choice
  const router = useRouter();
  // current user's name -- based on what is held in the redux store
  const userName = useSelector((state) => state.userResult.name);
  // login state held in the redux store
  const isLoggedIn = useSelector((state) => state.loginResult.isLoggedIn);

  // this state is so that we can open and close the profile picture dropdown onclick 
  const [isOpen, setIsOpen] = useState(false);

  // This updates the search page to its default state whenever you leave to a different page -- setTimeout is so it doesn't change instantly and look ugly
  const homeOnClick = () => {
    setTimeout(() => {
      dispatch(restartLoading());
    }, 1000);
  }; // need to UPDATE this function so it does this whenever the page is left -- not just when going home

  // whenever sign-out is clicked on the nav this will run
  // this updates the redux store to "Signed Out Status" so all the conditionally rendered stuff does what its supposed to
  const signOut = async () => {
    const response = await fetch('/api/auth/signout')
    dispatch(addLoginStatus(false));
    router.push('/');
  };

  return (
    <div className="z-20 sticky top-0 flex w-full items-center mt-2 px-2">
      <div className="navbar flex flex-row justify-between bg-base-150 rounded-2xl bg-slate-100 border border-slate-200 ">
        <Link href='/'>
          <Image src='/BBCoolLogo.png' alt='BB-Logo' width={400} height={100} className=" w-[50px] h-full transform scale-[200%] ml-4"/>
        </Link>
        <div className='absolute w-[97.2vw] justify-center '>
          <Link href='/' className='nav-color' onClick={homeOnClick}>
            <p className='btn btn-ghost nav-color flex items-center text-slate-600 hover:text-slate-950'>Home</p>
          </Link>
          <Link href='/search' className='nav-color'>
            <p className='btn btn-ghost nav-color flex items-center text-slate-600 hover:text-slate-950'>Search</p>
          </Link>
        </div>
        <div>
        {isLoggedIn ? (
          <div className='absolute right-10'>
          <Link href='/profile' className='nav-color'>
            <p className='btn btn-ghost nav-color flex items-center text-slate-600 hover:text-slate-950 px-10 max-w-[40px] mr-7'>Hi, {userName.split(' ')[0]}</p>
          </Link>
          </div>
        ) : (
          <div className='absolute right-4'>
          <Link href='/login' className='nav-color '>
            <p className='btn btn-ghost nav-color flex items-center text-slate-600 hover:text-slate-950'>Login</p>
          </Link>
          </div>
          
        )}
        </div>
        <div className="dropdown dropdown-end">
          {isLoggedIn ? (
            <label 
            tabIndex={0} 
            className="btn btn-ghost btn-circle avatar"
            onClick={() => setIsOpen(!isOpen)}
            >
            <div className="w-10 rounded-full">
              <Image id='profile-image' src="/taylor.jpeg" alt='taylor' width={200} height={1}/>
            </div>
          </label>
            ) : 
            <div></div>
          }
        
          
          {isOpen && (
            <ul 
              tabIndex={0} 
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 nav-color border border-slate-400"
            >
              <li>
                <Link className="justify-between" href='/profile' onClick={() => setIsOpen(false)}>
                  <p className='flex items-center text-slate-600'>Profile</p>
                </Link>
              </li>
              <li>
                <Link className="justify-between" href='/wishlist' onClick={() => setIsOpen(false)}>
                  <p className='flex items-center text-slate-600'>Wishlist</p>
                </Link>
              </li>
              <li>
                <p className='flex items-center text-slate-600' onClick={() => {setIsOpen(false); signOut();}}>Log Out</p>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

