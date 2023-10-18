import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast, ToastContainer } from 'react-toastify';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ZeroAddress } from 'ethers';
import { Link } from 'react-router-dom';

function AllBounties({
  unClaimedBounties,
  fetchAllBounties,
  wallet,
  connect,
  disconnect,
  connecting,
}) {
  const refreshBounties = useCallback(
    toToast => {
      console.log('fetching bounties..');
      fetchAllBounties();
      if (toToast) {
        toast.success('Bounty cancelled successfully!');
      }
    },
    [wallet, fetchAllBounties]
  );

  useEffect(() => {
    if (wallet) refreshBounties();
  }, [wallet]);

  useEffect(() => {
    console.log('unClaimedBounties', unClaimedBounties);
  }, [unClaimedBounties]);

  const shortenAddress = address => {
    return `${address.substr(0, 5)}...${address.substr(
      address.length - 5,
      address.length
    )}`;
  };

  return (
    <div className="my-bounties-wrap">
      {!wallet ? (
        <div>
          <h2>connect your wallet to view your bounties</h2>
          <button
            disabled={connecting}
            onClick={() =>
              wallet ? disconnect({ label: wallet.label }) : connect()
            }
          >
            {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
          </button>
        </div>
      ) : (
        <>
          <div className="bounties-table">
            <TableContainer>
              <Table>
                <TableHead className="table-wrap">
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Issuer</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Claimer</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unClaimedBounties.map(bounty => (
                    <TableRow key={bounty.id}>
                      <TableCell>{bounty.id}</TableCell>
                      <TableCell>{shortenAddress(bounty.issuer)}</TableCell>
                      <TableCell>{bounty.name}</TableCell>
                      <TableCell>{bounty.description}</TableCell>
                      <TableCell>{bounty.amount}</TableCell>
                      <TableCell>
                        {bounty.claimer === ZeroAddress
                          ? 'open'
                          : shortenAddress(bounty.claimer)}
                      </TableCell>
                      <TableCell>
                        {new Date(bounty.createdAt * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/bounties/${bounty.id}`}>
                          <button
                            type="button"
                            className="bounty-details-button"
                          >
                            details
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <ToastContainer />
        </>
      )}
    </div>
  );
}

AllBounties.propTypes = {
  unClaimedBounties: PropTypes.array.isRequired,
  wallet: PropTypes.object,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired,
  fetchAllBounties: PropTypes.func.isRequired,
  cancelBounty: PropTypes.func.isRequired,
};

export default AllBounties;
