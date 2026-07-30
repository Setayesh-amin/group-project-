function deleteMovie(){
    if(confirm("Delete Movie?")){
        fetch(window.location.pathname,{
            method:"DELETE"
        }).then(()=>{
            location="/";
        });
    }
}