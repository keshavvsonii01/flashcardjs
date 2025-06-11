import React from "react";

function Hero() {
  return (
    <>
      <section>
        <div className="flex flex-col items-center justify-center h-svh">
          <div>
            <h1 className="text-8xl font-bold text-center mb-4">Flash Mind</h1>
            <p className="text-lg text-center mb-8">
              AI helping you learn faster and better.
            </p>
            <div className="flex justify-between items-center">
              <a href="/login">
                <button className="px-7 py-2 bg-gray-600 text-white rounded-full hover:bg-slate-100 hover:text-black transition duration-300 cursor-pointer">
                  Login
                </button>
              </a>

              <a href="/signup">
                <button className="px-7 py-2 bg-gray-600 text-white rounded-full hover:bg-slate-100 hover:text-black transition duration-300 cursor-pointer">
                  Sign Up
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
