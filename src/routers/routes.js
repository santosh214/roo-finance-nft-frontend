import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StakingTwo from '../components/Staking/StakingTwo';
import Admin from '../components/Admin/Admin';
import StakingNFT from '../components/Staking/StakingPool';

const MyRouts = () => {
  return (
    <div>
      <Routes>
        <Route path='/'>
          <Route index element={<StakingTwo />} />
          <Route path=':id' element={<StakingNFT />} />
        </Route>
        <Route exact path='/admin' element={<Admin />} />
        <Route exact path='/admin/:address' element={<Admin />} />
      </Routes>
    </div>
  );
};
export default MyRouts;
